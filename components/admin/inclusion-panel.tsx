'use client';
import SimpleCrudPanel from './simple-crud-panel';
export default function InclusionPanel() {
    return (<SimpleCrudPanel category="WEDDING" title="Inclusions 관리" createLabel="새 Inclusion 등록" apiBase="/api/admin/inclusions" deleteConfirmText="이 인클루전을 삭제할까요?" emptyListText="등록된 Inclusion이 없습니다." fields={[
            { key: 'name', label: '내용', placeholder: '예: Wedding Ceremony Full Coverage', required: true },
        ]}/>);
}
