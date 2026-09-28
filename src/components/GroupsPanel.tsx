import { FormEvent, useEffect, useState } from 'react';
import { AppUser, supabase } from '../lib/supabase';
import { Plus, Users, Building2 } from 'lucide-react';

type Group = { id: string; name: string; description: string; created_by: string };
type Organization = { id: string; name: string };
const field = 'w-full rounded-xl border border-violet-100 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100';
const action = 'inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:opacity-50';

export function GroupsPanel({ user }: { user: AppUser }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [companies, setCompanies] = useState<Organization[]>([]);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [memberHandle, setMemberHandle] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [members, setMembers] = useState<Record<string, string[]>>({});
  const [organizations, setOrganizations] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = async () => {
    if (!supabase) return;
    const [groupResult, companyResult] = await Promise.all([
      supabase.from('groups').select('id,name,description,created_by').order('created_at', { ascending: false }),
      supabase.from('companies').select('id,name').order('name'),
    ]);
    if (groupResult.error) throw groupResult.error;
    if (companyResult.error) throw companyResult.error;
    const nextGroups = (groupResult.data ?? []) as Group[];
    setGroups(nextGroups);
    setCompanies((companyResult.data ?? []) as Organization[]);
    if (!selectedGroup && nextGroups[0]) setSelectedGroup(nextGroups[0].id);
    if (!nextGroups.length) return;
    const ids = nextGroups.map((group) => group.id);
    const [memberResult, organizationResult] = await Promise.all([
      supabase.from('group_members').select('group_id,user_id').in('group_id', ids),
      supabase.from('group_companies').select('group_id,company_id').in('group_id', ids),
    ]);
    if (memberResult.error) throw memberResult.error;
    if (organizationResult.error) throw organizationResult.error;
    const userIds = [...new Set((memberResult.data ?? []).map((item) => item.user_id))];
    const companyIds = [...new Set((organizationResult.data ?? []).map((item) => item.company_id))];
    const [profiles, organizationNames] = await Promise.all([
      userIds.length ? supabase.from('community_profiles').select('user_id,username').in('user_id', userIds) : Promise.resolve({ data: [], error: null }),
      companyIds.length ? supabase.from('companies').select('id,name').in('id', companyIds) : Promise.resolve({ data: [], error: null }),
    ]);
    if (profiles.error) throw profiles.error;
    if (organizationNames.error) throw organizationNames.error;
    const handles = new Map((profiles.data ?? []).map((profile) => [profile.user_id, profile.username]));
    const names = new Map((organizationNames.data ?? []).map((company) => [company.id, company.name]));
    setMembers(Object.fromEntries(nextGroups.map((group) => [group.id, (memberResult.data ?? []).filter((item) => item.group_id === group.id).map((item) => handles.get(item.user_id) ?? 'membro')])));
    setOrganizations(Object.fromEntries(nextGroups.map((group) => [group.id, (organizationResult.data ?? []).filter((item) => item.group_id === group.id).map((item) => names.get(item.company_id) ?? 'empresa')])));
  };

  useEffect(() => { void refresh().catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Não foi possível carregar os grupos.')); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage('');
    try {
      const { data, error } = await supabase.from('groups').insert({ name: groupName.trim(), description: description.trim(), created_by: user.id }).select('id').single();
      if (error) throw error;
      const { error: memberError } = await supabase.from('group_members').insert({ group_id: data.id, user_id: user.id, added_by: user.id });
      if (memberError) throw memberError;
      setGroupName(''); setDescription(''); setSelectedGroup(data.id);
      await refresh(); setMessage('Grupo criado.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível criar o grupo.'); }
    finally { setBusy(false); }
  };

  const addMember = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !selectedGroup) return;
    setBusy(true); setMessage('');
    try {
      const { data: profile, error: profileError } = await supabase.from('community_profiles').select('user_id,username').ilike('username', memberHandle.trim()).maybeSingle();
      if (profileError) throw profileError;
      if (!profile) throw new Error('Não encontrei esse nome de utilizador.');
      const { error } = await supabase.from('group_members').insert({ group_id: selectedGroup, user_id: profile.user_id, added_by: user.id });
      if (error && error.code !== '23505') throw error;
      setMemberHandle(''); await refresh(); setMessage(`@${profile.username} está no grupo.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível adicionar a pessoa.'); }
    finally { setBusy(false); }
  };

  const addCompany = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !selectedGroup || !companyId) return;
    setBusy(true); setMessage('');
    try {
      const { error } = await supabase.from('group_companies').insert({ group_id: selectedGroup, company_id: companyId, added_by: user.id });
      if (error && error.code !== '23505') throw error;
      setCompanyId(''); await refresh(); setMessage('Empresa adicionada ao grupo.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível adicionar a empresa.'); }
    finally { setBusy(false); }
  };

  const active = groups.find((group) => group.id === selectedGroup);
  const canManage = active?.created_by === user.id;

  return <section className="space-y-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-5 text-slate-900">
    <header className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><Users size={19} /></span><div><h2 className="font-semibold">Grupos</h2><p className="text-xs text-slate-500">Junta pessoas e empresas num espaço comum.</p></div></header>
    {message && <p role="status" className="rounded-lg bg-white px-3 py-2 text-sm text-violet-800">{message}</p>}
    <form onSubmit={submit} className="space-y-2">
      <input className={field} required minLength={2} maxLength={100} placeholder="Nome do grupo" value={groupName} onChange={(event) => setGroupName(event.target.value)} />
      <input className={field} maxLength={500} placeholder="Descrição (opcional)" value={description} onChange={(event) => setDescription(event.target.value)} />
      <button className={action} disabled={busy}><Plus size={16} /> Criar grupo</button>
    </form>
    {groups.length > 0 && <>
      <select className={field} value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>
      {active && <div className="space-y-3 rounded-xl bg-white p-4">
        <p className="font-semibold">{active.name}</p>{active.description && <p className="text-sm text-slate-600">{active.description}</p>}
        <p className="text-sm text-slate-600"><Users size={14} className="mr-1 inline" />{members[active.id]?.map((handle) => `@${handle}`).join(', ') || 'Sem membros'}</p>
        <p className="text-sm text-slate-600"><Building2 size={14} className="mr-1 inline" />{organizations[active.id]?.join(', ') || 'Sem empresas associadas'}</p>
        {canManage && <>
          <form onSubmit={addMember} className="flex gap-2"><input className={field} placeholder="Nome de utilizador" value={memberHandle} onChange={(event) => setMemberHandle(event.target.value)} /><button className={action} disabled={busy} aria-label="Adicionar pessoa"><Plus size={16} /></button></form>
          <form onSubmit={addCompany} className="flex gap-2"><select className={field} value={companyId} onChange={(event) => setCompanyId(event.target.value)}><option value="">Escolher empresa</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select><button className={action} disabled={busy || !companyId} aria-label="Adicionar empresa"><Plus size={16} /></button></form>
        </>}
      </div>}
    </>}
  </section>;
}
