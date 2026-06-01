import { FormEvent, useEffect, useState } from "react";
import type { AuthSession, ProfilePayload } from "../api/client";
import { getProfile, updateProfile } from "../api/client";
import { SectionFrame, WorkspaceHeader } from "../app/appShared";

export function SettingsPage(props: { session: AuthSession }) {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [form, setForm] = useState({ displayName: "", email: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getProfile(props.session)
      .then((payload) => {
        setProfile(payload);
        setForm({ displayName: payload.displayName, email: payload.email });
      })
      .catch(() => undefined);
  }, [props.session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const payload = await updateProfile(props.session, form);
      setProfile(payload);
      setMessage("个人资料已更新。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新资料失败。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <WorkspaceHeader
        description="这一页先保留最需要的个人资料入口，后面再扩展通知、偏好设置、同步与导出。"
        eyebrow="设置"
        title="让个人资料和工作区偏好有一个稳定入口"
      />
      <div className="settings-grid">
        <SectionFrame subtitle="个人资料" title={profile?.displayName || "账户信息"}>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              <span>显示名称</span>
              <input onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} value={form.displayName} />
            </label>
            <label>
              <span>邮箱</span>
              <input onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" value={form.email} />
            </label>
            <button className="primary-button" disabled={busy} type="submit">
              {busy ? "保存中..." : "保存设置"}
            </button>
          </form>
          {message ? <p className="muted-copy">{message}</p> : null}
        </SectionFrame>

        <SectionFrame subtitle="后续" title="下一步会补什么">
          <article className="placeholder-card">
            <strong>通知、同步和导出</strong>
            <p>这里会继续扩展阅读提醒、AI 结果通知、资料导出、偏好设置和账户安全相关配置。</p>
          </article>
        </SectionFrame>
      </div>
    </>
  );
}
