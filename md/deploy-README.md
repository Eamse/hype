# 점검 모드 (Maintenance Mode)

DB 백업/복구 작업이나 대규모 배포처럼, 서비스 자체를 잠깐 내려야 할 때
Nginx가 대신 점검 페이지를 응답하도록 하는 설정입니다.

## 1회성 설치 (새 서버 준비될 때)

1. 서버에 정적 파일 디렉토리 생성 후 점검 페이지 복사
   ```bash
   mkdir -p /var/www/hypepig
   cp deploy/maintenance.html /var/www/hypepig/maintenance.html
   ```
2. 기존 Nginx site 설정(`/etc/nginx/sites-available/hypepig`)의 `server { ... }`
   블록을 `deploy/nginx-maintenance-snippet.conf` 내용을 참고해서 수정
   (기존 `server_name`, `listen 443 ssl`, 인증서 경로 등은 그대로 유지하고
   `location /` 안쪽 로직만 반영)
3. 문법 확인 후 반영
   ```bash
   nginx -t
   systemctl reload nginx
   ```

## 평소 사용법 (설치 이후)

```bash
# 점검 시작
bash deploy/maintenance-on.sh

# ... DB 백업, 마이그레이션, 대규모 배포 등 작업 ...

# 점검 종료
bash deploy/maintenance-off.sh
```

플래그 파일(`/var/www/hypepig/maintenance.flag`) 유무만 확인하는 방식이라
nginx reload 없이 즉시 켜고 끌 수 있습니다.
