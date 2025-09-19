export default function TestDeployPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Deployment Test</h1>
      <p>If you can see this page, the latest deployment worked!</p>
      <p>Commit: 3c78f29</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  )
}
