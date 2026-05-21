export default function PrivacyPage() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">개인정보 처리방침</h1>
      <p className="text-sm text-gray-500 mb-6">최종 업데이트: 2026년 1월</p>

      <section className="space-y-6 text-sm leading-relaxed text-gray-700">
        <div>
          <h2 className="font-semibold text-base mb-2">1. 수집하는 정보</h2>
          <p>Momento는 다음 정보를 수집합니다:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>이메일 주소, 사용자 이름, 비밀번호 (암호화 저장)</li>
            <li>프로필 사진, 자기소개</li>
            <li>업로드한 사진과 게시물 내용</li>
            <li>댓글, 좋아요, 팔로우 활동</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">2. 정보 사용 목적</h2>
          <p>수집된 정보는 다음 용도로만 사용됩니다:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>계정 인증 및 서비스 제공</li>
            <li>피드 및 게시물 표시</li>
            <li>사용자 간 상호작용</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">3. 정보 보관 및 보호</h2>
          <p>비밀번호는 bcrypt로 해시 처리되어 저장됩니다. 모든 통신은 HTTPS로 암호화됩니다.</p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">4. 제3자 공유</h2>
          <p>Momento는 사용자 정보를 제3자에게 판매하거나 공유하지 않습니다.</p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">5. 사용자 권리</h2>
          <p>언제든지 다음 권리를 행사할 수 있습니다:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>계정 및 모든 데이터 삭제 (설정 페이지에서 가능)</li>
            <li>프로필 정보 수정</li>
            <li>업로드한 게시물 삭제</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">6. 문의</h2>
          <p>개인정보 관련 문의: support@momento.app</p>
        </div>
      </section>
    </div>
  );
}
