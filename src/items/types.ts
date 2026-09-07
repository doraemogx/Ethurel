export type ItemType = 'consumivel' | 'equipamento' | 'quest' | 'artefato' | 'material';
export type ItemIcon = 'ash' | 'thread' | 'trail' | 'shadow' | 'stone' | 'moss' | 'sigil' | 'bone';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  icon: ItemIcon;
  description: string;
  effect?: string;
}
