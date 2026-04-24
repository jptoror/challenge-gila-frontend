export default function StatusBadge({ success }) {
  const style = {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    background: success ? 'var(--color-green-bg)' : 'var(--color-red-bg)',
    color:      success ? 'var(--color-green-text)' : 'var(--color-red-text)',
  }
  return <span style={style}>{success ? 'Enviado' : 'Fallido'}</span>
}
