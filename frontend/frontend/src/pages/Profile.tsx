import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

type ProfileShape = {
  level_english?: string | null;
  allow_save_audio?: boolean | null;
  [k: string]: any;
};

type UserShape = {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  profile?: ProfileShape | null;
  [k: string]: any;
};

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export default function Profile(): JSX.Element {
  const auth = useAuth();
  const user = auth.getUser() as UserShape | null;

  const [profile, setProfile] = useState<ProfileShape | null>(user?.profile ?? null);
  const [firstName, setFirstName] = useState<string>(user?.first_name ?? "");
  const [lastName, setLastName] = useState<string>(user?.last_name ?? "");
  const [level, setLevel] = useState<string>(user?.profile?.level_english ?? user?.level_english ?? "");
  const [allowSaveAudio, setAllowSaveAudio] = useState<boolean>(Boolean(user?.profile?.allow_save_audio));

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageSuccess, setMessageSuccess] = useState<boolean>(false);

  const lastSavedRef = useRef({
    firstName,
    lastName,
    level,
    allowSaveAudio,
  });

  const fetchedOnceRef = useRef(false);
  const fetchControllerRef = useRef<AbortController | null>(null);
  const saveControllerRef = useRef<AbortController | null>(null);
  const saveCounterRef = useRef(0);

  useEffect(() => {
    if (user) {
      const p = user.profile ?? null;
      setProfile(p);
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
      setLevel(p?.level_english ?? "");
      setAllowSaveAudio(Boolean(p?.allow_save_audio));
      lastSavedRef.current = {
        firstName: user.first_name ?? "",
        lastName: user.last_name ?? "",
        level: p?.level_english ?? "",
        allowSaveAudio: Boolean(p?.allow_save_audio),
      };
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    if (!auth.isReady) return;
    if (fetchedOnceRef.current) return;
    if (auth.getUser()?.profile) return;

    fetchedOnceRef.current = true;
    fetchControllerRef.current = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const resp = await auth.refreshProfile();
        if (!mounted) return;
        const p = resp?.profile ?? resp;
        setProfile(p);
        setFirstName(resp?.first_name ?? "");
        setLastName(resp?.last_name ?? "");
        setLevel(p?.level_english ?? "");
        setAllowSaveAudio(Boolean(p?.allow_save_audio));
        lastSavedRef.current = {
          firstName: resp?.first_name ?? "",
          lastName: resp?.last_name ?? "",
          level: p?.level_english ?? "",
          allowSaveAudio: Boolean(p?.allow_save_audio),
        };
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      fetchControllerRef.current?.abort();
      fetchControllerRef.current = null;
    };
  }, [auth.isReady]);

  const isDirty =
    firstName !== lastSavedRef.current.firstName ||
    lastName !== lastSavedRef.current.lastName ||
    level !== lastSavedRef.current.level ||
    allowSaveAudio !== lastSavedRef.current.allowSaveAudio;

  const submitAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || saving || !isDirty) return;

    setSaving(true);
    setMessage(null);
    setMessageSuccess(false);

    saveControllerRef.current?.abort();
    saveControllerRef.current = new AbortController();
    const localSaveId = ++saveCounterRef.current;

    const payload = {
      first_name: firstName,
      last_name: lastName,
      profile: {
        level_english: level || null,
        allow_save_audio: allowSaveAudio,
      },
    };

    try {
      await api.put("/auth/profile/", payload, { signal: saveControllerRef.current.signal });
      const resp = await auth.refreshProfile();
      if (localSaveId !== saveCounterRef.current) return;
      const newProfile = resp.profile ?? resp;
      setProfile(newProfile);
      setFirstName(resp.first_name ?? "");
      setLastName(resp.last_name ?? "");
      setLevel(newProfile?.level_english ?? "");
      setAllowSaveAudio(Boolean(newProfile?.allow_save_audio));
      lastSavedRef.current = {
        firstName: resp.first_name ?? "",
        lastName: resp.last_name ?? "",
        level: newProfile?.level_english ?? "",
        allowSaveAudio: Boolean(newProfile?.allow_save_audio),
      };
      setMessage("Збережено.");
      setMessageSuccess(true);
    } catch {
      setMessage("Не вдалося зберегти. Спробуйте ще раз.");
      setMessageSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      fetchControllerRef.current?.abort();
      saveControllerRef.current?.abort();
    };
  }, []);

  if (!auth.isReady) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <form onSubmit={submitAll} style={{ maxWidth: 520 }}>
      <h2>Profile</h2>

      {message && (
        <div role="status" aria-live="polite" style={{ marginBottom: 12, color: messageSuccess ? "green" : "crimson" }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 13 }}>Email</label>
        <div style={{ color: "#444" }}>{user.email}</div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label htmlFor="first-name" style={{ display: "block", fontSize: 13 }}>
          First name
        </label>
        <input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: "100%" }} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label htmlFor="last-name" style={{ display: "block", fontSize: 13 }}>
          Last name
        </label>
        <input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ width: "100%" }} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label htmlFor="level" style={{ display: "block", fontSize: 13 }}>
          Level
        </label>
        <select id="level" value={level} onChange={(e) => setLevel(e.target.value)} style={{ width: "100%" }}>
          <option value="">—</option>
          {LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={allowSaveAudio} onChange={(e) => setAllowSaveAudio(e.target.checked)} />
          <span style={{ fontSize: 13 }}>Allow save audio</span>
        </label>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={saving || !isDirty}>
          {saving ? "Saving..." : "Save changes"}
        </button>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("Are you sure you want to logout?")) {
              auth.logout();
            }
          }}
          style={{ marginLeft: 8 }}
        >
          Logout
        </button>
      </div>

      {loading && <div style={{ marginTop: 8 }}>Loading profile…</div>}
    </form>
  );
}