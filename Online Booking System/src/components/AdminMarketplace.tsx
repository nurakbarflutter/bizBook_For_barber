import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Plus, Pencil, Trash2, Package, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdminMarketplaceProps {
  token: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  volume?: string;
}

const CATEGORIES = [
  { id: 'beard', name: 'Уход за бородой' },
  { id: 'styling', name: 'Стайлинг' },
  { id: 'shaving', name: 'Бритье' },
  { id: 'accessories', name: 'Аксессуары' },
  { id: 'body', name: 'Уход за телом' },
];

export function AdminMarketplace({ token }: AdminMarketplaceProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    category: 'beard',
    image: '',
    inStock: true,
    volume: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts(token);
      // Преобразуем данные из формата Supabase в формат компонента
      const formattedProducts = (data.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.image,
        inStock: p.in_stock,
        volume: p.volume,
      }));
      setProducts(formattedProducts);
    } catch (error) {
      toast.error('Ошибка загрузки товаров');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        image: product.image,
        inStock: product.inStock,
        volume: product.volume || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        description: '',
        price: '',
        category: 'beard',
        image: '',
        inStock: true,
        volume: '',
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      description: '',
      price: '',
      category: 'beard',
      image: '',
      inStock: true,
      volume: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.brand || !formData.price) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image || 'https://images.unsplash.com/photo-1605180427725-95e306fc0e9a?w=400&h=400&fit=crop',
        inStock: formData.inStock,
        volume: formData.volume,
      };

      if (editingProduct) {
        await api.updateProduct(token, editingProduct.id, productData);
        toast.success('Товар обновлен');
      } else {
        await api.createProduct(token, productData);
        toast.success('Товар добавлен');
      }

      handleCloseDialog();
      loadProducts();
    } catch (error) {
      toast.error('Ошибка сохранения товара');
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот товар?')) return;

    try {
      await api.deleteProduct(token, id);
      toast.success('Товар удален');
      loadProducts();
    } catch (error) {
      toast.error('Ошибка удаления товара');
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            Маркетплейс
          </h2>
          <p className="text-zinc-400 mt-1">Управление товарами магазина</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-amber-500 hover:bg-amber-600 text-zinc-900"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить товар
        </Button>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">Товары еще не добавлены</p>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-900"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить первый товар
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all"
            >
              {/* Product Image */}
              <div className="relative h-40 bg-zinc-900">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {!product.inStock && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Нет в наличии
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <p className="text-amber-500 text-sm mb-1">{product.brand}</p>
                <h3 className="text-white mb-2">{product.name}</h3>
                <p className="text-zinc-400 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                {product.volume && (
                  <p className="text-zinc-500 text-xs mb-2">{product.volume}</p>
                )}
                <p className="text-xl text-white mb-3">{product.price} с</p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(product)}
                    className="flex-1 bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Изменить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product.id)}
                    className="bg-zinc-900 border-zinc-700 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-zinc-300">Название *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Масло для бороды"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="brand" className="text-zinc-300">Бренд *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Beard Kings"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-zinc-300">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание товара"
                rows={3}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price" className="text-zinc-300">Цена (сом) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="1200"
                  required
                  min="0"
                  step="1"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="volume" className="text-zinc-300">Объем</Label>
                <Input
                  id="volume"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="30 мл"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-zinc-300">Категория</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="image" className="text-zinc-300">URL изображения</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Можно использовать Unsplash или любую другую ссылку
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
              />
              <Label htmlFor="inStock" className="text-zinc-300">В наличии</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-zinc-900"
              >
                {editingProduct ? 'Сохранить' : 'Добавить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}