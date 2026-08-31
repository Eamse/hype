// 어드민 로그인 페이지 경로 — URL 추측을 어렵게 하기 위해 /admin 하위가 아닌 난독화된 경로 사용
export const ADMIN_LOGIN_PATH = '/gatekeeper-7f3k9';

// 로그인 후 실제 대시보드 라우트 경로 (app/gatekeeper-7f3k9/panel). /admin 같은
// 짐작하기 쉬운 경로를 쓰지 않기 위해 로그인 경로 하위에 둠.
export const ADMIN_PANEL_PATH = `${ADMIN_LOGIN_PATH}/panel`;
