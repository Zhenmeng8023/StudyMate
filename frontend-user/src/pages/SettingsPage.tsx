import { FormEvent, useEffect, useState } from "react";
import type { AuthSession, ProfilePayload } from "../api/client";
import { getProfile, updateProfile } from "../api/client";
import { SectionFrame, WorkspaceHeader } from "../app/appShared";
import { DataState } from "../design-system/primitives";

type SettingsProfileState =
  | {
      kind: "loading" | "error" | "empty";
      title: string;
      description: string;
    }
  | null;

export function SettingsPage(props: { session: AuthSession }) {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [form, setForm] = useState({ displayName: "", email: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  async function loadProfile() {
    setLoadingProfile(true);
    setProfileError("");
    setMessage("");

    try {
      const payload = await getProfile(props.session);
      setProfile(payload);
      setForm({ displayName: payload.displayName, email: payload.email });
    } catch (error) {
      setProfile(null);
      setProfileError(error instanceof Error ? error.message : "个人资料加载失败");
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    void loadProfile();
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

  const profileState: SettingsProfileState = loadingProfile && !profile
    ? {
        kind: "loading",
        title: "正在加载个人资料",
        description: "正在读取你的账户基础信息与学习空间设置。"
      }
    : profileError
      ? {
          kind: "error",
          title: "个人资料暂时不可用",
          description: profileError
        }
      : profile
        ? null
        : {
            kind: "empty",
            title: "个人资料暂未初始化",
            description: "账户基础信息还没有准备完成，请稍后重新加载。"
          };

  return (
    <>
      <WorkspaceHeader
        description="管理显示名称、邮箱和账户基础信息；这些设置不会改变已经沉淀的资料、笔记、图谱和复习记录。"
        eyebrow="个人空间"
        title="账户与学习空间"
      />
      <div className="settings-grid">
        <SectionFrame subtitle="个人资料" title={profile?.displayName || "账户信息"}>
          {profileState ? (
            <DataState
              action={
                profileState.kind === "error" || profileState.kind === "empty" ? (
                  <button className="secondary-button" onClick={() => void loadProfile()} type="button">
                    重新加载
                  </button>
                ) : undefined
              }
              description={profileState.description}
              kind={profileState.kind}
              title={profileState.title}
            />
          ) : (
            <>
              <form className="form-stack" onSubmit={handleSubmit}>
                <label>
                  <span>显示名称</span>
                  <input
                    onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                    value={form.displayName}
                  />
                </label>
                <label>
                  <span>邮箱</span>
                  <input
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    type="email"
                    value={form.email}
                  />
                </label>
                <button className="primary-button" disabled={busy} type="submit">
                  {busy ? "保存中..." : "保存设置"}
                </button>
              </form>
              {message ? <p className="muted-copy">{message}</p> : null}
            </>
          )}
        </SectionFrame>

        <SectionFrame subtitle="账户状态" title="学习空间说明">
          <article className="placeholder-card settings-space-card">
            <span className="settings-space-card__mark">学</span>
            <div>
              <strong>资料与学习资产</strong>
              <p>资料、笔记、图谱和复习记录按账户边界组织。修改显示名称和邮箱不会影响已有学习内容。</p>
            </div>
          </article>
        </SectionFrame>
      </div>
    </>
  );
}
