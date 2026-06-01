import os
import uuid
from datetime import datetime
from flask import Flask, render_template, redirect, url_for, request, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from PIL import Image

app = Flask(__name__)
app.config['SECRET_KEY'] = 'insta-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instagram.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = '로그인이 필요합니다.'
login_manager.login_message_category = 'info'

# 팔로우 관계 테이블
follows = db.Table('follows',
    db.Column('follower_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('followed_id', db.Integer, db.ForeignKey('user.id'))
)

# 좋아요 테이블
likes = db.Table('likes',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'))
)


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    bio = db.Column(db.String(150), default='')
    profile_image = db.Column(db.String(200), default='default_profile.png')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    posts = db.relationship('Post', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='author', lazy='dynamic', cascade='all, delete-orphan')

    followed = db.relationship(
        'User', secondary=follows,
        primaryjoin=(follows.c.follower_id == id),
        secondaryjoin=(follows.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic'),
        lazy='dynamic'
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def follow(self, user):
        if not self.is_following(user):
            self.followed.append(user)

    def unfollow(self, user):
        if self.is_following(user):
            self.followed.remove(user)

    def is_following(self, user):
        return self.followed.filter(follows.c.followed_id == user.id).count() > 0

    def feed_posts(self):
        followed_posts = Post.query.join(
            follows, (follows.c.followed_id == Post.user_id)
        ).filter(follows.c.follower_id == self.id)
        own_posts = Post.query.filter_by(user_id=self.id)
        return followed_posts.union(own_posts).order_by(Post.created_at.desc())


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_file = db.Column(db.String(200), nullable=False)
    caption = db.Column(db.String(500), default='')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    comments = db.relationship('Comment', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    liked_by = db.relationship('User', secondary=likes, backref=db.backref('liked_posts', lazy='dynamic'))

    def like_count(self):
        return len(self.liked_by)

    def is_liked_by(self, user):
        return user in self.liked_by


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String(300), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_image(file, size=(800, 800)):
    filename = str(uuid.uuid4()) + '.jpg'
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    img = Image.open(file)
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')
    img.thumbnail(size, Image.LANCZOS)
    img.save(filepath, 'JPEG', quality=85)
    return filename


# 홈 피드
@app.route('/')
@login_required
def index():
    posts = current_user.feed_posts().all()
    return render_template('index.html', posts=posts)


# 탐색 페이지
@app.route('/explore')
@login_required
def explore():
    posts = Post.query.order_by(Post.created_at.desc()).limit(30).all()
    return render_template('explore.html', posts=posts)


# 회원가입
@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm = request.form.get('confirm', '')

        if not username or not email or not password:
            flash('모든 항목을 입력해주세요.', 'danger')
            return redirect(url_for('register'))
        if password != confirm:
            flash('비밀번호가 일치하지 않습니다.', 'danger')
            return redirect(url_for('register'))
        if len(password) < 6:
            flash('비밀번호는 최소 6자 이상이어야 합니다.', 'danger')
            return redirect(url_for('register'))
        if User.query.filter_by(username=username).first():
            flash('이미 사용 중인 사용자 이름입니다.', 'danger')
            return redirect(url_for('register'))
        if User.query.filter_by(email=email).first():
            flash('이미 등록된 이메일입니다.', 'danger')
            return redirect(url_for('register'))

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        flash('회원가입이 완료되었습니다! 로그인해주세요.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')


# 로그인
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user, remember=True)
            return redirect(url_for('index'))
        flash('사용자 이름 또는 비밀번호가 올바르지 않습니다.', 'danger')
    return render_template('login.html')


# 로그아웃
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


# 사진 업로드
@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    if request.method == 'POST':
        if 'image' not in request.files:
            flash('이미지를 선택해주세요.', 'danger')
            return redirect(url_for('upload'))
        file = request.files['image']
        if file.filename == '':
            flash('이미지를 선택해주세요.', 'danger')
            return redirect(url_for('upload'))
        if not allowed_file(file.filename):
            flash('JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.', 'danger')
            return redirect(url_for('upload'))

        filename = save_image(file)
        caption = request.form.get('caption', '').strip()
        post = Post(image_file=filename, caption=caption, user_id=current_user.id)
        db.session.add(post)
        db.session.commit()
        flash('게시물이 업로드되었습니다!', 'success')
        return redirect(url_for('index'))
    return render_template('upload.html')


# 좋아요 토글
@app.route('/like/<int:post_id>', methods=['POST'])
@login_required
def like(post_id):
    post = Post.query.get_or_404(post_id)
    if post.is_liked_by(current_user):
        post.liked_by.remove(current_user)
        liked = False
    else:
        post.liked_by.append(current_user)
        liked = True
    db.session.commit()
    return jsonify({'liked': liked, 'count': post.like_count()})


# 댓글 추가
@app.route('/comment/<int:post_id>', methods=['POST'])
@login_required
def comment(post_id):
    post = Post.query.get_or_404(post_id)
    body = request.form.get('body', '').strip()
    if body:
        c = Comment(body=body, user_id=current_user.id, post_id=post.id)
        db.session.add(c)
        db.session.commit()
    return redirect(request.referrer or url_for('index'))


# 프로필 페이지
@app.route('/profile/<username>')
@login_required
def profile(username):
    user = User.query.filter_by(username=username).first_or_404()
    posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).all()
    return render_template('profile.html', user=user, posts=posts)


# 프로필 편집
@app.route('/edit_profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    if request.method == 'POST':
        bio = request.form.get('bio', '').strip()
        current_user.bio = bio[:150]

        if 'profile_image' in request.files:
            file = request.files['profile_image']
            if file and file.filename and allowed_file(file.filename):
                filename = save_image(file, size=(200, 200))
                current_user.profile_image = filename

        db.session.commit()
        flash('프로필이 업데이트되었습니다.', 'success')
        return redirect(url_for('profile', username=current_user.username))
    return render_template('edit_profile.html')


# 팔로우/언팔로우
@app.route('/follow/<username>', methods=['POST'])
@login_required
def follow(username):
    user = User.query.filter_by(username=username).first_or_404()
    if user == current_user:
        return jsonify({'error': '자기 자신을 팔로우할 수 없습니다.'}), 400
    if current_user.is_following(user):
        current_user.unfollow(user)
        following = False
    else:
        current_user.follow(user)
        following = True
    db.session.commit()
    return jsonify({
        'following': following,
        'followers_count': user.followers.count()
    })


# 게시물 삭제
@app.route('/delete_post/<int:post_id>', methods=['POST'])
@login_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.author != current_user:
        flash('권한이 없습니다.', 'danger')
        return redirect(url_for('index'))
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], post.image_file)
    if os.path.exists(image_path):
        os.remove(image_path)
    db.session.delete(post)
    db.session.commit()
    flash('게시물이 삭제되었습니다.', 'success')
    return redirect(url_for('profile', username=current_user.username))


# 사용자 검색
@app.route('/search')
@login_required
def search():
    q = request.args.get('q', '').strip()
    users = []
    if q:
        users = User.query.filter(User.username.ilike(f'%{q}%')).limit(20).all()
    return render_template('search.html', users=users, q=q)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, port=5000)
