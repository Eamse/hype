'use client';
import SimpleCrudPanel from './simple-crud-panel';
export default function AddonPanel() {
    return (<SimpleCrudPanel category="WEDDING" title="Addons 관리" createLabel="새 Addon 등록" apiBase="/api/admin/addons" deleteConfirmText="이 애드온을 삭제할까요?" emptyListText="등록된 Addon이 없습니다." gridColumns="2fr 1fr 3fr" fields={[
            { key: 'name', label: '제목', placeholder: '제목', required: true },
            { key: 'price', label: '금액', placeholder: '금액', type: 'number', showInSummary: true, summaryPrefix: '$' },
            { key: 'desc', label: '설명', placeholder: '설명', showInDetailView: true },
        ]}/>);
}
