import { useEffect, useState } from 'react'
import client from '../../api/client'
import Layout from '../../components/Layout'

interface WorkflowMeta {
  id: string
  name: string
  category: string
}

interface User {
  id: number
  username: string
  email: string | null
  is_admin: boolean
  is_active: boolean
  permissions: string[]
}

interface Group {
  id: number
  name: string
  description: string | null
  workflow_ids: string[]
  member_ids: number[]
}

interface CreateForm {
  username: string
  email: string
  password: string
  is_admin: boolean
}

const EMPTY_CREATE: CreateForm = { username: '', email: '', password: '', is_admin: false }

type Tab = 'users' | 'groups'

export default function UserManagement() {
  const [tab, setTab] = useState<Tab>('users')

  const [users, setUsers] = useState<User[]>([])
  const [workflows, setWorkflows] = useState<WorkflowMeta[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE)
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  const [permUser, setPermUser] = useState<User | null>(null)
  const [permSelection, setPermSelection] = useState<string[]>([])
  const [permSaving, setPermSaving] = useState(false)

  const [resetUser, setResetUser] = useState<User | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  // Group modals
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [groupForm, setGroupForm] = useState({ name: '', description: '' })
  const [groupFormError, setGroupFormError] = useState('')
  const [groupFormLoading, setGroupFormLoading] = useState(false)

  const [groupPermGroup, setGroupPermGroup] = useState<Group | null>(null)
  const [groupPermSelection, setGroupPermSelection] = useState<string[]>([])
  const [groupPermSaving, setGroupPermSaving] = useState(false)

  const [groupMembersGroup, setGroupMembersGroup] = useState<Group | null>(null)
  const [groupMemberSelection, setGroupMemberSelection] = useState<number[]>([])
  const [groupMembersSaving, setGroupMembersSaving] = useState(false)

  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const refreshUsers = () => client.get('/admin/users').then((r) => setUsers(r.data))
  const refreshGroups = () => client.get('/admin/groups').then((r) => setGroups(r.data))

  useEffect(() => {
    Promise.all([
      client.get('/admin/users'),
      client.get('/admin/workflows'),
      client.get('/admin/groups'),
    ])
      .then(([u, w, g]) => {
        setUsers(u.data)
        setWorkflows(w.data)
        setGroups(g.data)
      })
      .finally(() => setLoading(false))
  }, [])

  /* ── Create user ── */
  const handleCreate = async () => {
    setCreateError('')
    if (!createForm.username || !createForm.password) {
      setCreateError('Username and password are required.')
      return
    }
    setCreateLoading(true)
    try {
      await client.post('/admin/users', createForm)
      setShowCreate(false)
      setCreateForm(EMPTY_CREATE)
      await refreshUsers()
      showToast('User created successfully.')
    } catch (err: unknown) {
      setCreateError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          'Failed to create user.',
      )
    } finally {
      setCreateLoading(false)
    }
  }

  /* ── Toggle admin / active ── */
  const handleToggleAdmin = async (user: User) => {
    await client.put(`/admin/users/${user.id}`, { is_admin: !user.is_admin })
    await refreshUsers()
    showToast(`${user.username} is now ${!user.is_admin ? 'an admin' : 'a regular user'}.`)
  }

  const handleToggleActive = async (user: User) => {
    await client.put(`/admin/users/${user.id}`, { is_active: !user.is_active })
    await refreshUsers()
    showToast(`${user.username} ${!user.is_active ? 'enabled' : 'disabled'}.`)
  }

  /* ── Delete user ── */
  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete user "${user.username}"? This cannot be undone.`)) return
    await client.delete(`/admin/users/${user.id}`)
    await refreshUsers()
    showToast(`User "${user.username}" deleted.`)
  }

  /* ── Reset password modal ── */
  const handleResetPassword = async () => {
    setResetError('')
    if (resetPassword.length < 8) {
      setResetError('Password must be at least 8 characters.')
      return
    }
    setResetLoading(true)
    try {
      await client.put(`/admin/users/${resetUser!.id}`, { password: resetPassword })
      setResetUser(null)
      setResetPassword('')
      showToast(`Password reset for "${resetUser!.username}".`)
    } catch (err: unknown) {
      setResetError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          'Failed to reset password.',
      )
    } finally {
      setResetLoading(false)
    }
  }

  /* ── User permissions modal ── */
  const openPermissions = (user: User) => {
    setPermUser(user)
    setPermSelection(user.permissions)
  }

  const togglePerm = (id: string) =>
    setPermSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const savePermissions = async () => {
    if (!permUser) return
    setPermSaving(true)
    try {
      await client.put(`/admin/users/${permUser.id}/permissions`, {
        workflow_ids: permSelection,
      })
      setPermUser(null)
      await refreshUsers()
      showToast('Permissions saved.')
    } finally {
      setPermSaving(false)
    }
  }

  /* ── Create group ── */
  const handleCreateGroup = async () => {
    setGroupFormError('')
    if (!groupForm.name.trim()) {
      setGroupFormError('Group name is required.')
      return
    }
    setGroupFormLoading(true)
    try {
      await client.post('/admin/groups', {
        name: groupForm.name.trim(),
        description: groupForm.description.trim() || null,
      })
      setShowCreateGroup(false)
      setGroupForm({ name: '', description: '' })
      await refreshGroups()
      showToast('Group created successfully.')
    } catch (err: unknown) {
      setGroupFormError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          'Failed to create group.',
      )
    } finally {
      setGroupFormLoading(false)
    }
  }

  /* ── Delete group ── */
  const handleDeleteGroup = async (group: Group) => {
    if (!window.confirm(`Delete group "${group.name}"? This cannot be undone.`)) return
    await client.delete(`/admin/groups/${group.id}`)
    await refreshGroups()
    showToast(`Group "${group.name}" deleted.`)
  }

  /* ── Group permissions modal ── */
  const openGroupPermissions = (group: Group) => {
    setGroupPermGroup(group)
    setGroupPermSelection(group.workflow_ids)
  }

  const toggleGroupPerm = (id: string) =>
    setGroupPermSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const saveGroupPermissions = async () => {
    if (!groupPermGroup) return
    setGroupPermSaving(true)
    try {
      await client.put(`/admin/groups/${groupPermGroup.id}/permissions`, {
        workflow_ids: groupPermSelection,
      })
      setGroupPermGroup(null)
      await refreshGroups()
      showToast('Group permissions saved.')
    } finally {
      setGroupPermSaving(false)
    }
  }

  /* ── Group members modal ── */
  const openGroupMembers = (group: Group) => {
    setGroupMembersGroup(group)
    setGroupMemberSelection(group.member_ids)
  }

  const toggleGroupMember = (id: number) =>
    setGroupMemberSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const saveGroupMembers = async () => {
    if (!groupMembersGroup) return
    setGroupMembersSaving(true)
    try {
      await client.put(`/admin/groups/${groupMembersGroup.id}/members`, {
        user_ids: groupMemberSelection,
      })
      setGroupMembersGroup(null)
      await refreshGroups()
      showToast('Group members saved.')
    } finally {
      setGroupMembersSaving(false)
    }
  }

  const groupedWorkflows = workflows.reduce<Record<string, WorkflowMeta[]>>((acc, wf) => {
    if (!acc[wf.category]) acc[wf.category] = []
    acc[wf.category].push(wf)
    return acc
  }, {})

  const workflowName = (id: string) => workflows.find((w) => w.id === id)?.name ?? id
  const userName = (id: number) => users.find((u) => u.id === id)?.username ?? String(id)

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Header + action button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        {tab === 'users' ? (
          <button
            onClick={() => { setShowCreate(true); setCreateError('') }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            + New User
          </button>
        ) : (
          <button
            onClick={() => { setShowCreateGroup(true); setGroupFormError('') }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            + New Group
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {(['users', 'groups'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize rounded-t-md transition-colors ${
              tab === t
                ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : tab === 'users' ? (
        /* ── Users Table ── */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Workflows</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const groupCount = groups.filter((g) => g.member_ids.includes(user.id)).length
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{user.username}</div>
                      {user.email && (
                        <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_admin ? (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <span className="text-green-600 text-xs font-medium">Active</span>
                      ) : (
                        <span className="text-red-500 text-xs font-medium">Disabled</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_admin ? (
                        <span className="text-xs text-gray-400 italic">All (admin)</span>
                      ) : (
                        <span className="text-xs text-gray-600">
                          {user.permissions.length} direct
                          {groupCount > 0 && ` · ${groupCount} group${groupCount > 1 ? 's' : ''}`}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        {!user.is_admin && (
                          <button
                            onClick={() => openPermissions(user)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Permissions
                          </button>
                        )}
                        <button
                          onClick={() => { setResetUser(user); setResetPassword(''); setResetError('') }}
                          className="text-xs text-gray-500 hover:text-gray-800"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => handleToggleAdmin(user)}
                          className="text-xs text-gray-500 hover:text-gray-800"
                        >
                          {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className="text-xs text-gray-500 hover:text-gray-800"
                        >
                          {user.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Groups Table ── */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {groups.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No groups yet. Create one to assign shared workflow access.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Group</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Workflows</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Members</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{group.name}</div>
                      {group.description && (
                        <div className="text-xs text-gray-400 mt-0.5">{group.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">
                        {group.workflow_ids.length === 0
                          ? 'None'
                          : `${group.workflow_ids.length} assigned`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">
                        {group.member_ids.length === 0
                          ? 'No members'
                          : `${group.member_ids.length} member${group.member_ids.length > 1 ? 's' : ''}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openGroupPermissions(group)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Workflows
                        </button>
                        <button
                          onClick={() => openGroupMembers(group)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Members
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Create User Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createForm.is_admin}
                  onChange={(e) => setCreateForm((p) => ({ ...p, is_admin: e.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm text-gray-700">Admin user (access to all workflows + user management)</span>
              </label>
            </div>

            {createError && (
              <p className="text-red-600 text-sm mt-3">{createError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={createLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {createLoading ? 'Creating…' : 'Create User'}
              </button>
              <button
                onClick={() => { setShowCreate(false); setCreateError('') }}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── User Permissions Modal ── */}
      {permUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">Edit Workflow Permissions</h2>
            <p className="text-sm text-gray-500 mb-5">
              User: <strong className="text-gray-700">{permUser.username}</strong>
            </p>

            <div className="space-y-5">
              {Object.entries(groupedWorkflows).map(([category, wfs]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {wfs.map((wf) => (
                      <label
                        key={wf.id}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={permSelection.includes(wf.id)}
                          onChange={() => togglePerm(wf.id)}
                          className="h-4 w-4 rounded"
                        />
                        <span className="text-sm text-gray-800 group-hover:text-gray-900">
                          {wf.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={savePermissions}
                disabled={permSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {permSaving ? 'Saving…' : 'Save Permissions'}
              </button>
              <button
                onClick={() => setPermUser(null)}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {resetUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-4">
              User: <strong className="text-gray-700">{resetUser.username}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                autoFocus
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters.</p>
            </div>
            {resetError && <p className="text-red-600 text-sm mt-3">{resetError}</p>}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {resetLoading ? 'Saving…' : 'Set Password'}
              </button>
              <button
                onClick={() => setResetUser(null)}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Group Modal ── */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Group</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {groupFormError && <p className="text-red-600 text-sm mt-3">{groupFormError}</p>}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateGroup}
                disabled={groupFormLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {groupFormLoading ? 'Creating…' : 'Create Group'}
              </button>
              <button
                onClick={() => { setShowCreateGroup(false); setGroupFormError('') }}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Group Workflow Permissions Modal ── */}
      {groupPermGroup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">Group Workflow Access</h2>
            <p className="text-sm text-gray-500 mb-5">
              Group: <strong className="text-gray-700">{groupPermGroup.name}</strong>
            </p>
            <div className="space-y-5">
              {Object.entries(groupedWorkflows).map(([category, wfs]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {wfs.map((wf) => (
                      <label key={wf.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={groupPermSelection.includes(wf.id)}
                          onChange={() => toggleGroupPerm(wf.id)}
                          className="h-4 w-4 rounded"
                        />
                        <span className="text-sm text-gray-800 group-hover:text-gray-900">
                          {wf.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveGroupPermissions}
                disabled={groupPermSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {groupPermSaving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setGroupPermGroup(null)}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Group Members Modal ── */}
      {groupMembersGroup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">Group Members</h2>
            <p className="text-sm text-gray-500 mb-5">
              Group: <strong className="text-gray-700">{groupMembersGroup.name}</strong>
            </p>
            <div className="space-y-2">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={groupMemberSelection.includes(u.id)}
                    onChange={() => toggleGroupMember(u.id)}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm text-gray-800 group-hover:text-gray-900">
                    {u.username}
                    {u.is_admin && (
                      <span className="ml-2 text-xs text-blue-500">(admin)</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveGroupMembers}
                disabled={groupMembersSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {groupMembersSaving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setGroupMembersGroup(null)}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
