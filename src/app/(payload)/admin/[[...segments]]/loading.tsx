export default function AdminPageLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99998,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '2rem',
            height: '2rem',
            border: '3px solid #e5e7eb',
            borderTopColor: '#0e6e6e',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'admin-spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes admin-spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Loading admin…</p>
      </div>
    </div>
  )
}
