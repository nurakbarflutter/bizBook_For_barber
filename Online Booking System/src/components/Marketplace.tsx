import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Filter, X, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PRODUCT_CATEGORIES } from '../utils/mock-data';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { api } from '../utils/api';

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

interface CartItem extends Product {
  quantity: number;
}

interface MarketplaceProps {
  onBack?: () => void;
}

export function Marketplace({ onBack }: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      // Преобразуем данные из формата Supabase в формат компонента
      const formattedProducts = (data.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.image,
        inStock: p.in_stock !== undefined ? p.in_stock : true,
        volume: p.volume,
      }));
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter(item => item.quantity > 0);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl text-white flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-amber-500" />
                  Магазин
                </h1>
                <p className="text-zinc-400 text-sm">Профессиональная косметика для ухода</p>
              </div>
            </div>

            <Button
              onClick={() => setShowCart(true)}
              className="bg-amber-500 hover:bg-amber-600 text-zinc-900 relative"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Корзина
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-amber-500" />
            <h3 className="text-white">Категории</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? 'bg-amber-500 hover:bg-amber-600 text-zinc-900'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 group"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden bg-zinc-900">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center">
                      <Badge variant="destructive">Нет в наличии</Badge>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-amber-500 text-sm mb-1">{product.brand}</p>
                  <h3 className="text-white mb-2">{product.name}</h3>
                  <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {product.volume && (
                    <p className="text-zinc-500 text-xs mb-3">{product.volume}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl text-white">{product.price} с</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className="bg-amber-500 hover:bg-amber-600 text-zinc-900"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      В корзину
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-sm">Made in <span className="text-amber-500">BizBook</span></p>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
                <h2 className="text-2xl text-white">Корзина</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCart(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {cart.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-400">Корзина пуста</p>
                </div>
              ) : (
                <>
                  <div className="p-6 space-y-4">
                    {cart.map(item => (
                      <div
                        key={item.id}
                        className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4"
                      >
                        <div className="flex gap-3">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-amber-500 text-xs mb-1">{item.brand}</p>
                            <h4 className="text-white text-sm mb-2">{item.name}</h4>
                            <div className="flex items-center justify-between">
                              <span className="text-white">{item.price} с</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="h-8 w-8 p-0 bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-white w-8 text-center">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="h-8 w-8 p-0 bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-6 space-y-4">
                    <div className="flex items-center justify-between text-xl">
                      <span className="text-zinc-400">Итого:</span>
                      <span className="text-white">{cartTotal} с</span>
                    </div>
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-900 py-6">
                      Оформить заказ
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      onClick={() => setShowCart(false)}
                    >
                      Продолжить покупки
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}