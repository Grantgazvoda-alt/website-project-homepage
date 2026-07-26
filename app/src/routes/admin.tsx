import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [editingScope, setEditingScope] = useState<string | null>(null);
  const [newScope, setNewScope] = useState("read");
  const [updateResult, setUpdateResult] = useState<string | null>(null);

  const { data: keys, isLoading, refetch } = useQuery({
    queryKey: ["provenance", "admin", "keys"],
    queryFn: async () => {
      const { listApiKeys } = await import("../lib/provenance-auth.server");
      return listApiKeys("admin") as any;
    },
  });

  const handleUpdateScope = async (keyId: string) => {
    try {
      const { updateApiKeyScope } = await import("../lib/provenance-auth.server");
      await updateApiKeyScope(keyId, newScope);
      setUpdateResult("Scope updated successfully");
      setEditingScope(null);
      refetch();
    } catch (e) {
      setUpdateResult("Error: " + (e instanceof Error ? e.message : "Failed to update scope"));
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Delete this API key? This cannot be undone.")) return;
    try {
      const { deleteApiKey } = await import("../lib/provenance-auth.server");
      await deleteApiKey(keyId);
      setUpdateResult("API key deleted");
      refetch();
    } catch (e) {
      setUpdateResult("Error: " + (e instanceof Error ? e.message : "Failed to delete key"));
    }
  };

  const keyList = (keys as any[]) ?? [];

  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-[#f5f5f7]">
      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.8)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071E3] to-[#0082ff]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
            </div>
            <span className="font-semibold">Provenance</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">Dashboard</Link>
            <Link to="/records" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">Records</Link>
            <Link to="/docs" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">API Docs</Link>
            <Link to="/audit" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">Audit Log</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
            <p className="mt-1 text-[#98989d]">API key management and scope administration</p>
          </div>
          <Link to="/dashboard" className="text-sm text-[#0071E3] hover:text-[#0082ff]">Create New Key -></Link>
        </div>

        {updateResult && (
          <div className={"mb-6 rounded-lg p-3 text-sm " + (updateResult.startsWith("Error") ? "bg-[rgba(255,69,58,0.1)] text-[#ff453a] border border-[rgba(255,69,58,0.2)]" : "bg-[rgba(48,209,88,0.1)] text-[#30d158] border border-[rgba(48,209,88,0.2)]")}>
            {updateResult}
            <button onClick={() => setUpdateResult(null)} className="ml-2 text-xs">&times;</button>
          </div>
        )}

        <div className="glass rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071E3] border-t-transparent" />
            </div>
          ) : keyList.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[#98989d]">No API keys found. Create one from the Dashboard.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.4)] text-left text-xs uppercase tracking-wide text-[#98989d]">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Scope</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Key ID</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keyList.map((key: any) => (
                  <tr key={key.id} className="border-b border-[rgba(255,255,255,0.03)] transition hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="px-4 py-3 font-medium">{key.name}</td>
                    <td className="px-4 py-3">
                      {editingScope === key.id ? (
                        <div className="flex items-center gap-1">
                          <select value={newScope} onChange={(e) => setNewScope(e.target.value)}
                            className="rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,15,0.8)] px-2 py-1 text-xs text-[#f5f5f7] outline-none">
                            <option value="read">read</option>
                            <option value="write">write</option>
                            <option value="admin">admin</option>
                          </select>
                          <button onClick={() => handleUpdateScope(key.id)} className="rounded bg-[#0071E3] px-2 py-1 text-[10px] font-medium text-white">Save</button>
                          <button onClick={() => setEditingScope(null)} className="text-[10px] text-[#636366]">Cancel</button>
                        </div>
                      ) : (
                        <span className={"rounded px-2 py-0.5 text-xs font-medium " + (
                          key.scopes === "read" ? "bg-[rgba(0,113,227,0.15)] text-[#0071E3]"
                          : key.scopes === "write" ? "bg-[rgba(48,209,88,0.15)] text-[#30d158]"
                          : "bg-[rgba(255,69,58,0.15)] text-[#ff453a]"
                        )}>{key.scopes}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#636366]">{key.role}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#636366]">{key.id.slice(0, 12)}...</td>
                    <td className="px-4 py-3 text-[#636366] text-xs">{key.created_at ? new Date(key.created_at + "Z").toLocaleDateString() : "--"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingScope(key.id); setNewScope(key.scopes); }}
                          className="rounded px-2 py-1 text-[10px] text-[#0071E3] transition hover:bg-[rgba(0,113,227,0.1)]">Edit Scope</button>
                        <button onClick={() => handleDeleteKey(key.id)}
                          className="rounded px-2 py-1 text-[10px] text-[#ff453a] transition hover:bg-[rgba(255,69,58,0.1)]">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Scope Management</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[rgba(0,113,227,0.2)] bg-[rgba(0,113,227,0.05)] p-4">
              <p className="text-xs font-medium text-[#0071E3] mb-1">Read Only</p>
              <p className="text-[10px] text-[#98989d]">Query records, lineage, and analytics. Cannot create or modify data.</p>
            </div>
            <div className="rounded-lg border border-[rgba(48,209,88,0.2)] bg-[rgba(48,209,88,0.05)] p-4">
              <p className="text-xs font-medium text-[#30d158] mb-1">Read & Write</p>
              <p className="text-[10px] text-[#98989d]">Create and update records, deployments, and certificates. Cannot delete.</p>
            </div>
            <div className="rounded-lg border border-[rgba(255,69,58,0.2)] bg-[rgba(255,69,58,0.05)] p-4">
              <p className="text-xs font-medium text-[#ff453a] mb-1">Admin</p>
              <p className="text-[10px] text-[#98989d]">Full access including delete. Can manage all API keys and scopes.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}