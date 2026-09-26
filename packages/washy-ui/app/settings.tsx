import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, Shield, Sliders, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { PhysicalButton } from '../src/shared/ui/PhysicalButton';
import { db } from '../src/shared/lib/db';
import { users, userSettings } from 'washy-core/src/db/schema';
import { eq } from 'drizzle-orm';

const LOCAL_USER_ID = 'local-user-default';

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [naggingProfile, setNaggingProfile] = useState<'SOFT' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [autoDoneDaysThreshold, setAutoDoneDaysThreshold] = useState<number>(3);
  const [defaultWasherMins, setDefaultWasherMins] = useState<number>(30);

  useEffect(() => {
    async function loadSettings() {
      try {
        const existing = await db.select().from(userSettings).where(eq(userSettings.userId, LOCAL_USER_ID));
        if (existing.length > 0) {
          const setting = existing[0];
          setNaggingProfile((setting.naggingProfile as 'SOFT' | 'MEDIUM' | 'HARD') || 'MEDIUM');
          setAutoDoneDaysThreshold(setting.autoDoneDaysThreshold ?? 3);
          setDefaultWasherMins(setting.defaultWasherMins ?? 30);
        } else {
          // Intentar obtener cualquier usuario o usar por defecto
          const allSettings = await db.select().from(userSettings);
          if (allSettings.length > 0) {
            const s = allSettings[0];
            setNaggingProfile((s.naggingProfile as 'SOFT' | 'MEDIUM' | 'HARD') || 'MEDIUM');
            setAutoDoneDaysThreshold(s.autoDoneDaysThreshold ?? 3);
            setDefaultWasherMins(s.defaultWasherMins ?? 30);
          }
        }
      } catch (err) {
        console.error('Error cargando ajustes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      // 1. Asegurar que existe el usuario local en users
      const userCheck = await db.select().from(users).where(eq(users.id, LOCAL_USER_ID));
      if (userCheck.length === 0) {
        await db.insert(users).values({
          id: LOCAL_USER_ID,
          name: 'Usuario Principal',
          createdAt: new Date(),
        }).onConflictDoNothing();
      }

      // 2. Upsert userSettings
      const settingCheck = await db.select().from(userSettings).where(eq(userSettings.userId, LOCAL_USER_ID));
      if (settingCheck.length > 0) {
        await db.update(userSettings)
          .set({
            naggingProfile,
            autoDoneDaysThreshold,
            defaultWasherMins,
          })
          .where(eq(userSettings.userId, LOCAL_USER_ID));
      } else {
        await db.insert(userSettings).values({
          userId: LOCAL_USER_ID,
          naggingProfile,
          autoDoneDaysThreshold,
          defaultWasherMins,
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar ajustes:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={32} color="#e5e5e5" />
        </TouchableOpacity>
        <Text style={styles.title}>Perfil de Insistencia</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* SECCIÓN 1: NAGGING PROFILE */}
        <View style={styles.sectionHeader}>
          <Bell size={22} color="#10b981" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Modo de Notificación (Nagging)</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Ajusta qué tan insistente debe ser Washy según tu nivel de energía y tolerancia al estrés.
        </Text>

        {/* TARJETAS DE NAGGING */}
        <TouchableOpacity
          style={[styles.profileCard, naggingProfile === 'SOFT' && styles.profileCardActive]}
          onPress={() => setNaggingProfile('SOFT')}
          activeOpacity={0.8}
        >
          <View style={styles.profileHeader}>
            <Text style={styles.profileIcon}>🌸</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>SOFT (Modo Empático)</Text>
              <Text style={styles.profileSub}>Baja energía / Cero presión</Text>
            </View>
            {naggingProfile === 'SOFT' && <CheckCircle2 size={24} color="#10b981" />}
          </View>
          <Text style={styles.profileDetail}>
            Recibes una sola notificación al terminar el lavado. Si no respondes, no volverá a molestar en todo el día.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.profileCard, naggingProfile === 'MEDIUM' && styles.profileCardActive]}
          onPress={() => setNaggingProfile('MEDIUM')}
          activeOpacity={0.8}
        >
          <View style={styles.profileHeader}>
            <Text style={styles.profileIcon}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>MEDIUM (Equilibrado)</Text>
              <Text style={styles.profileSub}>Recordatorios periódicos</Text>
            </View>
            {naggingProfile === 'MEDIUM' && <CheckCircle2 size={24} color="#10b981" />}
          </View>
          <Text style={styles.profileDetail}>
            Recordatorios cada 45 minutos si la ropa se queda en la lavadora o en el tendedero.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.profileCard, naggingProfile === 'HARD' && styles.profileCardActive]}
          onPress={() => setNaggingProfile('HARD')}
          activeOpacity={0.8}
        >
          <View style={styles.profileHeader}>
            <Text style={styles.profileIcon}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>HARD (Anti-Avoidance)</Text>
              <Text style={styles.profileSub}>Modo Asertivo / Alta Fricción</Text>
            </View>
            {naggingProfile === 'HARD' && <CheckCircle2 size={24} color="#10b981" />}
          </View>
          <Text style={styles.profileDetail}>
            Alertas cada 15 minutos mientras haya ropa húmeda en riesgo. Diseñado para vencer la parálisis y la evadida total.
          </Text>
        </TouchableOpacity>

        {/* SECCIÓN 2: PARÁMETROS DEL RITUAL */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Sliders size={22} color="#10b981" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Reglas y Tolerancias</Text>
        </View>

        {/* TOLERANCIA SILLA-CLÓSET */}
        <View style={styles.settingBox}>
          <View style={styles.settingLabelRow}>
            <Calendar size={18} color="#a3a3a3" style={{ marginRight: 8 }} />
            <Text style={styles.settingLabel}>Tolerancia Silla-Clóset</Text>
          </View>
          <Text style={styles.settingSubtext}>
            Días que una tanda doblada puede permanecer en la silla antes de archivarse automáticamente a DONE.
          </Text>

          <View style={styles.optionsRow}>
            {[1, 2, 3, 5, 7].map((days) => (
              <TouchableOpacity
                key={days}
                style={[styles.chip, autoDoneDaysThreshold === days && styles.chipActive]}
                onPress={() => setAutoDoneDaysThreshold(days)}
              >
                <Text style={[styles.chipText, autoDoneDaysThreshold === days && styles.chipTextActive]}>
                  {days} {days === 1 ? 'día' : 'días'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TIEMPO LAVADORA DEFAULT */}
        <View style={styles.settingBox}>
          <View style={styles.settingLabelRow}>
            <Clock size={18} color="#a3a3a3" style={{ marginRight: 8 }} />
            <Text style={styles.settingLabel}>Lavadora por Defecto</Text>
          </View>
          <Text style={styles.settingSubtext}>
            Duración por defecto del ciclo de lavado si la prenda no especifica regla en el diccionario.
          </Text>

          <View style={styles.optionsRow}>
            {[20, 30, 45, 60].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[styles.chip, defaultWasherMins === mins && styles.chipActive]}
                onPress={() => setDefaultWasherMins(mins)}
              >
                <Text style={[styles.chipText, defaultWasherMins === mins && styles.chipTextActive]}>
                  {mins} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* BOTÓN GUARDAR */}
        <View style={{ marginTop: 36, marginBottom: 24 }}>
          {savedSuccess && (
            <View style={styles.successBanner}>
              <CheckCircle2 size={20} color="#10b981" />
              <Text style={styles.successText}>¡Ajustes guardados correctamente!</Text>
            </View>
          )}

          <PhysicalButton
            label={saving ? 'Guardando...' : 'Guardar Preferencias'}
            variant="primary"
            onPress={handleSave}
          />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171717' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, marginTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#e5e5e5' },
  backButton: { padding: 8, marginLeft: -8 },

  content: { paddingHorizontal: 24, paddingBottom: 48 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  sectionDescription: { fontSize: 14, color: '#a3a3a3', marginBottom: 18, lineHeight: 20 },

  profileCard: {
    backgroundColor: '#262626',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  profileCardActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  profileIcon: { fontSize: 24, marginRight: 12 },
  profileName: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
  profileSub: { fontSize: 12, color: '#10b981', marginTop: 2 },
  profileDetail: { fontSize: 14, color: '#d4d4d4', lineHeight: 20, marginLeft: 36 },

  settingBox: { backgroundColor: '#262626', padding: 18, borderRadius: 16, marginBottom: 16 },
  settingLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  settingLabel: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
  settingSubtext: { fontSize: 13, color: '#a3a3a3', marginBottom: 14, lineHeight: 18 },

  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#171717',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#404040',
  },
  chipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  chipText: { color: '#a3a3a3', fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#171717', fontWeight: 'bold' },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  successText: { color: '#10b981', fontWeight: 'bold', fontSize: 14 },
});
