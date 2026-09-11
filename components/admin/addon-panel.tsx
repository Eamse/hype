'use client';
import SimpleCrudPanel from './simple-crud-panel';
export default function AddonPanel() {
    return (<SimpleCrudPanel category="WEDDING" title="Addons 관리" createLabel="새 Addon 등록" apiBase="/api/admin/addons" deleteConfirmText="이 애드온을 삭제할까요?" emptyListText="등록된 Addon이 없습니다." gridColumns="1fr 1fr 1fr" fields={[
            { key: 'name', label: '관리명', placeholder: '어드민에서 구분할 이름을 입력하세요', required: true },
            { key: 'displayName', label: '공개 표시명', placeholder: '고객 화면에 노출될 이름을 입력하세요', required: true },
            { key: 'price', label: '금액', placeholder: '금액', type: 'number', showInSummary: true, summaryPrefix: '$' },
            { key: 'desc', label: '설명 (줄바꿈한 대로 프론트에 그대로 표시됩니다)', placeholder: '설명', type: 'textarea', showInDetailView: true, fullWidth: true },
        ]}/>);
}
