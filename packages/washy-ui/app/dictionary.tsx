import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, ShieldAlert, Droplets, Wind, Play } from 'lucide-react';
import { PhysicalButton } from '../src/shared/ui/PhysicalButton';
import { db } from '../src/shared/lib/db';
import { batches, batchEvents } from 'washy-core/src/db/schema';

export default function DictionaryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  // Normalizador para ignorar acentos y mayúsculas (Fuzzy Search Básico)
  const normalizeText = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Mock Database con Sinónimos Regionales (Guatemala y LATAM)
  const commonGarments = [
    { id: '1', name: 'Jeans / Mezclilla', category: 'Armor', temp: 'WARM', cycle: 'NORMAL', synonyms: ['pantalón de lona', 'lona', 'vaqueros', 'pantalon', 'denim'] },
    { id: '2', name: 'Playeras / Algodón', category: 'Soft', temp: 'COLD', cycle: 'EXPRESS', synonyms: ['camiseta', 'remera', 't-shirt', 'polo', 'franela'] },
    { id: '3', name: 'Ropa de Gimnasio / Shorts', category: 'Tech', temp: 'COLD', cycle: 'DELICATE', synonyms: ['licras', 'leggings', 'pantaloneta', 'pants', 'deportiva', 'entreno', 'yoga', 'short', 'shorts'] },
    { id: '4', name: 'Suéter de Lana', category: 'Delicate', temp: 'COLD', cycle: 'DELICATE', synonyms: ['sueter', 'jersey', 'tejido'] },
    { id: '5', name: 'Toallas', category: 'Armor', temp: 'HOT', cycle: 'HEAVY', synonyms: ['toalla', 'paño', 'toallon'] },
    { id: '6', name: 'Sábanas y Edredones', category: 'Armor', temp: 'WARM', cycle: 'NORMAL', synonyms: ['sabanas', 'funda', 'almohada', 'edredon', 'colcha', 'cobija', 'frazada', 'chamarra de cama'] },
    { id: '7', name: 'Ropa Interior', category: 'Soft', temp: 'WARM', cycle: 'NORMAL', synonyms: ['calzon', 'calzoncillo', 'boxer', 'sosten', 'brasier', 'tanga', 'calcetines', 'tines', 'chones', 'panty'] },
    { id: '8', name: 'Chamarra Puffer', category: 'Armor', temp: 'COLD', cycle: 'DELICATE', synonyms: ['chumpa', 'chaqueta', 'casaca', 'abrigo'] },
    { id: '9', name: 'Trajes de Baño / Calzonetas', category: 'Delicate', temp: 'COLD', cycle: 'DELICATE', synonyms: ['calzoneta', 'traje de baño', 'bañador', 'bikini', 'bermuda'] },
    { id: '10', name: 'Shorts de Vestir / Casuales', category: 'Soft', temp: 'COLD', cycle: 'NORMAL', synonyms: ['short', 'shorts', 'pantaloneta de vestir', 'bermuda casual', 'caqui', 'lino', 'algodon'] },
  ];

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = normalizeText(searchQuery);
      const filtered = commonGarments.filter(g => {
        const matchName = normalizeText(g.name).includes(query);
        const matchCategory = normalizeText(g.category).includes(query);
        const matchSynonyms = g.synonyms.some(syn => normalizeText(syn).includes(query));
        return matchName || matchCategory || matchSynonyms;
      });
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const handleStartBatch = async (categoryName: string) => {
    try {
      const newBatchId = crypto.randomUUID();
      await db.insert(batches).values({
        id: newBatchId,
        status: 'BACKLOG',
        priorityScore: 50,
        createdAt: new Date(),
        metadata: { source: 'DICTIONARY', garmentCategory: categoryName }
      });
      
      await db.insert(batchEvents).values({
        id: crypto.randomUUID(),
        batchId: newBatchId,
        eventType: 'STATE_CHANGE',
        toStatus: 'BACKLOG',
        createdAt: new Date(),
      });

      router.push(`/batch/${newBatchId}`);
    } catch (err) {
      console.error('Error iniciando tanda desde diccionario:', err);
    }
  };

  const showSafeDefault = searchQuery.trim().length > 0 && results.length === 0;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={32} color="#e5e5e5" />
        </TouchableOpacity>
        <Text style={styles.title}>Inventario de Telas</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#a3a3a3" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Ej. Jeans, Seda, Gym, Lana..."
          placeholderTextColor="#737373"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* INSTRUCCIONES INICIALES */}
        {searchQuery.trim().length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>¿Dudas con una prenda?</Text>
            <Text style={styles.emptyText}>
              Busca el tipo de tela. Si no la encuentras, te daremos una regla segura para que puedas lavar sin arruinar nada.
            </Text>
          </View>
        )}

        {/* RESULTADOS EXACTOS */}
        {results.map((item) => (
          <View key={item.id} style={styles.resultCard}>
            <Text style={styles.resultTitle}>{item.name}</Text>
            <View style={styles.tags}>
              <View style={[styles.tag, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.tagText}>{item.category}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: item.temp === 'HOT' ? '#ef4444' : item.temp === 'WARM' ? '#f59e0b' : '#3b82f6' }]}>
                <Droplets size={12} color="#fff" style={{marginRight: 4}} />
                <Text style={styles.tagText}>{item.temp}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: '#6366f1' }]}>
                <Wind size={12} color="#fff" style={{marginRight: 4}} />
                <Text style={styles.tagText}>{item.cycle}</Text>
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              <PhysicalButton
                label={`🚀 Iniciar Tanda con ${item.category}`}
                variant="primary"
                onPress={() => handleStartBatch(item.category)}
              />
            </View>
          </View>
        ))}

        {/* DEFAULT SEGURO (ANTI-PARÁLISIS) */}
        {showSafeDefault && (
          <View style={styles.safeDefaultCard}>
            <View style={styles.safeDefaultHeader}>
              <ShieldAlert size={28} color="#10b981" />
              <Text style={styles.safeDefaultTitle}>No encontrada. Usa el Default Seguro.</Text>
            </View>
            <Text style={styles.safeDefaultText}>
              Evita la parálisis por análisis. Mete la prenda a la lavadora usando esta configuración inofensiva:
            </Text>
            
            <View style={styles.safeDefaultRules}>
              <View style={styles.ruleBox}>
                <Text style={styles.ruleLabel}>Temperatura</Text>
                <Text style={styles.ruleValue}>Agua Fría</Text>
              </View>
              <View style={styles.ruleBox}>
                <Text style={styles.ruleLabel}>Ciclo</Text>
                <Text style={styles.ruleValue}>Delicado</Text>
              </View>
            </View>
            
            <View style={{ marginTop: 24 }}>
              <PhysicalButton 
                label="Volver e iniciar tanda"
                variant="primary"
                onPress={() => router.back()}
              />
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171717' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#e5e5e5' },
  backButton: { padding: 8, marginLeft: -8 },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    marginHorizontal: 24,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, height: 56, color: '#ffffff', fontSize: 18, outlineStyle: 'none' },
  
  content: { paddingHorizontal: 24, paddingBottom: 48 },
  
  emptyState: { alignItems: 'center', marginTop: 60, opacity: 0.6 },
  emptyTitle: { fontSize: 20, color: '#ffffff', fontWeight: 'bold', marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#a3a3a3', textAlign: 'center', lineHeight: 24 },
  
  resultCard: { backgroundColor: '#262626', padding: 20, borderRadius: 16, marginBottom: 16 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
  tags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  
  safeDefaultCard: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 24, borderRadius: 16, borderColor: '#10b981', borderWidth: 2, marginTop: 16 },
  safeDefaultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  safeDefaultTitle: { fontSize: 18, fontWeight: 'bold', color: '#10b981', flex: 1 },
  safeDefaultText: { color: '#e5e5e5', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  
  safeDefaultRules: { flexDirection: 'row', gap: 16 },
  ruleBox: { flex: 1, backgroundColor: '#262626', padding: 16, borderRadius: 12, alignItems: 'center' },
  ruleLabel: { color: '#a3a3a3', fontSize: 12, marginBottom: 4 },
  ruleValue: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
