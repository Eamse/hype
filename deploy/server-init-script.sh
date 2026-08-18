#!/bin/bash
set -e

# ── iwinv 서버 생성 시 자동 실행되는 초기 보안 설정 스크립트 ──────────────
# "사용자 스크립트 등록"란에 이 파일 내용을 그대로 붙여넣으면 됩니다.
# 서버 최초 부팅 시 root 권한으로 한 번 실행됩니다.

# 1) 패키지 최신화
apt-get update -y
apt-get upgrade -y

# 2) fail2ban 설치 — SSH 브루트포스(비밀번호 무작위 대입) 방어
#    일정 횟수 이상 로그인 실패한 IP를 자동으로 일정 시간 차단합니다.
apt-get install -y fail2ban
cat > /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled = true
port = 22
filter = sshd
maxretry = 5
findtime = 600
bantime = 3600
EOF
systemctl enable fail2ban
systemctl restart fail2ban

# 3) SSH 보안 설정 — 비밀번호 로그인 차단, 키 로그인만 허용
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^#\?PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
systemctl restart sshd

# 4) 방화벽(UFW) 기본 규칙 — SSH/HTTP/HTTPS만 허용
apt-get install -y ufw
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 5) 자동 보안 업데이트 활성화 — OS 취약점 패치 자동 적용
apt-get install -y unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "서버 초기 보안 설정 완료"
