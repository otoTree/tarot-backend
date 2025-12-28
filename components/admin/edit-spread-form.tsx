'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash, ArrowLeft, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link';

interface SpreadPosition {
  id?: number;
  positionIndex: string;
  name: string;
  description: string;
  x: number;
  y: number;
}

interface Spread {
  id: number;
  slug: string;
  lang: string;
  name: string;
  description: string;
  detail: string | null;
  difficulty: string | null;
  recommended: boolean | null;
  tags: string[] | null;
  positions: SpreadPosition[];
}

interface SpreadFormData {
    id?: number;
    name: string;
    description: string;
    detail: string;
    difficulty: string;
    tags: string;
    positions: SpreadPosition[];
}

export function EditSpreadForm({ spreads }: { spreads: Spread[] }) {
  const router = useRouter();
  
  const enSpread = spreads.find(s => s.lang === 'en');
  const zhSpread = spreads.find(s => s.lang === 'zh');
  
  const defaultSpread = enSpread || zhSpread || spreads[0];

  const [slug, setSlug] = useState(defaultSpread?.slug || '');
  const [recommended, setRecommended] = useState(defaultSpread?.recommended || false);
  
  const [enData, setEnData] = useState<SpreadFormData>({
      id: enSpread?.id,
      name: enSpread?.name || '',
      description: enSpread?.description || '',
      detail: enSpread?.detail || '',
      difficulty: enSpread?.difficulty || '',
      tags: enSpread?.tags ? enSpread.tags.join(', ') : '',
      positions: enSpread?.positions || [],
  });

  const [zhData, setZhData] = useState<SpreadFormData>({
      id: zhSpread?.id,
      name: zhSpread?.name || '',
      description: zhSpread?.description || '',
      detail: zhSpread?.detail || '',
      difficulty: zhSpread?.difficulty || '',
      tags: zhSpread?.tags ? zhSpread.tags.join(', ') : '',
      positions: zhSpread?.positions || [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("en");

  const updateFormData = (lang: 'en' | 'zh', updates: Partial<SpreadFormData>) => {
      if (lang === 'en') {
          setEnData(prev => ({ ...prev, ...updates }));
      } else {
          setZhData(prev => ({ ...prev, ...updates }));
      }
  };

  const handlePositionChange = (lang: 'en' | 'zh', index: number, field: keyof SpreadPosition, value: string | number) => {
    const currentData = lang === 'en' ? enData : zhData;
    const newPositions = [...currentData.positions];
    // @ts-ignore
    newPositions[index] = { ...newPositions[index], [field]: value };
    updateFormData(lang, { positions: newPositions });
  };

  const addPosition = (lang: 'en' | 'zh') => {
      const currentData = lang === 'en' ? enData : zhData;
      const positions = currentData.positions;
      const newPos = {
        positionIndex: String(positions.length + 1),
        name: '',
        description: '',
        x: 0,
        y: 0,
      };
      updateFormData(lang, { positions: [...positions, newPos] });
  };

  const removePosition = (lang: 'en' | 'zh', index: number) => {
      const currentData = lang === 'en' ? enData : zhData;
      const newPositions = currentData.positions.filter((_, i) => i !== index);
      updateFormData(lang, { positions: newPositions });
  };

  const syncLayout = () => {
      // Sync from active tab to inactive tab
      const source = activeTab === 'en' ? enData : zhData;
      const targetLang = activeTab === 'en' ? 'zh' : 'en';
      const targetData = activeTab === 'en' ? zhData : enData;

      // Map positions by index or just copy if length matches
      // Simple strategy: Copy x, y, positionIndex. Keep name/desc if exists.
      
      const newTargetPositions = source.positions.map((srcPos, i) => {
          const targetPos = targetData.positions[i];
          return {
              positionIndex: srcPos.positionIndex,
              x: srcPos.x,
              y: srcPos.y,
              name: targetPos?.name || '', // Keep target name or empty
              description: targetPos?.description || '', // Keep target desc or empty
              id: targetPos?.id, // Keep target ID
          };
      });

      updateFormData(targetLang, { positions: newTargetPositions });
      alert(`Layout synced from ${activeTab.toUpperCase()} to ${targetLang.toUpperCase()}`);
  };

  const saveSpread = async (lang: 'en' | 'zh', data: SpreadFormData) => {
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id ? `/api/admin/spreads/${data.id}` : `/api/admin/spreads`;
      
      const payload = {
          slug,
          lang,
          recommended,
          name: data.name,
          description: data.description,
          detail: data.detail,
          difficulty: data.difficulty,
          tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
          positions: data.positions,
      };

      const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
      });

      if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || `Failed to save ${lang.toUpperCase()} version`);
      }
      
      return await res.json();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
        // Save EN
        if (enData.name) {
            await saveSpread('en', enData);
        }
        // Save ZH
        if (zhData.name) {
             await saveSpread('zh', zhData);
        }

      router.refresh();
      router.push('/admin/spreads');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete ALL versions of this spread?')) return;
    setIsDeleting(true);

    try {
      if (enSpread?.id) await fetch(`/api/admin/spreads/${enSpread.id}`, { method: 'DELETE' });
      if (zhSpread?.id) await fetch(`/api/admin/spreads/${zhSpread.id}`, { method: 'DELETE' });

      router.refresh();
      router.push('/admin/spreads');
    } catch (error) {
      console.error(error);
      alert('Failed to delete spread');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderForm = (lang: 'en' | 'zh') => {
      const data = lang === 'en' ? enData : zhData;
      return (
          <div className="grid gap-6 md:grid-cols-2 mt-4">
            <Card>
            <CardHeader>
                <CardTitle>{lang === 'en' ? 'English' : 'Chinese'} Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label>Name</Label>
                <Input
                    value={data.name}
                    onChange={(e) => updateFormData(lang, { name: e.target.value })}
                />
                </div>
                <div className="space-y-2">
                <Label>Difficulty</Label>
                <Input
                    value={data.difficulty}
                    onChange={(e) => updateFormData(lang, { difficulty: e.target.value })}
                />
                </div>
                <div className="space-y-2">
                <Label>Description</Label>
                <Input
                    value={data.description}
                    onChange={(e) => updateFormData(lang, { description: e.target.value })}
                />
                </div>
                <div className="space-y-2">
                <Label>Detail (Markdown)</Label>
                <Textarea
                    value={data.detail}
                    onChange={(e) => updateFormData(lang, { detail: e.target.value })}
                    className="min-h-[80px]"
                />
                </div>
                <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                    value={data.tags}
                    onChange={(e) => updateFormData(lang, { tags: e.target.value })}
                />
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Positions</CardTitle>
                    <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={syncLayout} title="Sync layout from active tab">
                           Sync Layout
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => addPosition(lang)}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.positions.map((pos, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Position #{index + 1}</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removePosition(lang, index)}>
                            <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Index ID</Label>
                            <Input 
                                value={pos.positionIndex}
                                onChange={(e) => handlePositionChange(lang, index, 'positionIndex', e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Name</Label>
                            <Input 
                                value={pos.name}
                                onChange={(e) => handlePositionChange(lang, index, 'name', e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input 
                            value={pos.description}
                            onChange={(e) => handlePositionChange(lang, index, 'description', e.target.value)}
                            className="h-8 text-xs"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">X Coordinate</Label>
                            <Input 
                                type="number"
                                value={pos.x}
                                onChange={(e) => handlePositionChange(lang, index, 'x', Number(e.target.value))}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Y Coordinate</Label>
                            <Input 
                                type="number"
                                value={pos.y}
                                onChange={(e) => handlePositionChange(lang, index, 'y', Number(e.target.value))}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>
                </div>
                ))}
            </CardContent>
            </Card>
        </div>
      );
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/spreads">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-light">Edit Spread: {slug}</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete All'}
            </Button>
            <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
        </div>
      </div>

      <Card className="p-4">
          <div className="flex gap-4 items-end">
            <div className="space-y-2 w-1/3">
              <Label htmlFor="slug">Slug (Shared)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
             <div className="flex items-center space-x-2 pb-3">
                <Checkbox 
                    id="recommended" 
                    checked={recommended}
                    onCheckedChange={(checked) => setRecommended(checked as boolean)}
                  />
                  <label
                    htmlFor="recommended"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Featured spread
                  </label>
            </div>
          </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="zh">Chinese</TabsTrigger>
        </TabsList>
        <TabsContent value="en">
            {renderForm('en')}
        </TabsContent>
        <TabsContent value="zh">
            {renderForm('zh')}
        </TabsContent>
      </Tabs>
    </form>
  );
}
