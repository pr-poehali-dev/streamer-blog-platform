import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface VKUser {
  id: number;
  first_name: string;
  last_name: string;
  photo_200?: string;
}

interface Giveaway {
  id: number;
  title: string;
  prize: string;
  endDate: string;
  participants: number;
  isParticipating?: boolean;
}

const VK_AUTH_URL = 'https://functions.poehali.dev/1a4ff10d-4c2a-4649-824c-eb64b1540d2f';
const GIVEAWAYS_URL = 'https://functions.poehali.dev/fe692e3c-cd0d-4f49-ab5f-525ce84ef957';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [giveawayEmail, setGiveawayEmail] = useState('');
  const [vkUser, setVkUser] = useState<VKUser | null>(null);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const games = [
    { name: 'Valorant', icon: '🎯', color: 'bg-red-500' },
    { name: 'PUBG', icon: '🔫', color: 'bg-orange-500' },
    { name: 'Dota 2', icon: '⚔️', color: 'bg-purple-500' },
    { name: 'CS2', icon: '💣', color: 'bg-blue-500' },
  ];

  const schedule = [
    { day: 'Понедельник', game: 'Valorant', time: '19:00 - 23:00' },
    { day: 'Вторник', game: 'CS2', time: '20:00 - 00:00' },
    { day: 'Среда', game: 'Dota 2', time: '19:00 - 23:00' },
    { day: 'Четверг', game: 'PUBG', time: '18:00 - 22:00' },
    { day: 'Пятница', game: 'Valorant', time: '19:00 - 01:00' },
    { day: 'Суббота', game: 'CS2', time: '16:00 - 00:00' },
    { day: 'Воскресенье', game: 'Dota 2', time: '16:00 - 22:00' },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('vk_user');
    if (storedUser) {
      setVkUser(JSON.parse(storedUser));
    }
    loadGiveaways();
  }, []);

  useEffect(() => {
    if (vkUser) {
      loadGiveaways();
    }
  }, [vkUser]);

  const loadGiveaways = async () => {
    try {
      const headers: any = {};
      if (vkUser) {
        headers['X-Vk-Id'] = vkUser.id.toString();
      }
      
      const response = await fetch(GIVEAWAYS_URL, { headers });
      const data = await response.json();
      setGiveaways(data.giveaways || []);
    } catch (error) {
      console.error('Error loading giveaways:', error);
    }
  };

  const handleVKLogin = () => {
    const vkAppId = '52741095';
    const redirectUri = window.location.origin;
    const vkAuthUrl = `https://oauth.vk.com/authorize?client_id=${vkAppId}&display=popup&redirect_uri=${redirectUri}&scope=&response_type=token&v=5.131`;
    
    const width = 600;
    const height = 400;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      vkAuthUrl,
      'vk_auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const checkPopup = setInterval(() => {
      try {
        if (popup && popup.location.href.includes('access_token')) {
          const hash = popup.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const userId = params.get('user_id');
          
          if (accessToken && userId) {
            fetchVKUserData(accessToken, userId);
            popup.close();
            clearInterval(checkPopup);
          }
        }
        
        if (popup && popup.closed) {
          clearInterval(checkPopup);
        }
      } catch (e) {
        
      }
    }, 500);
  };

  const fetchVKUserData = async (accessToken: string, userId: string) => {
    try {
      setIsLoading(true);
      const vkApiUrl = `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_200&access_token=${accessToken}&v=5.131`;
      const response = await fetch(vkApiUrl);
      const data = await response.json();
      
      if (data.response && data.response[0]) {
        const user = data.response[0];
        const vkUserData: VKUser = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          photo_200: user.photo_200
        };
        
        const authResponse = await fetch(VK_AUTH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vk_user: vkUserData })
        });
        
        if (authResponse.ok) {
          setVkUser(vkUserData);
          localStorage.setItem('vk_user', JSON.stringify(vkUserData));
          loadGiveaways();
        }
      }
    } catch (error) {
      console.error('Error fetching VK user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVKLogout = () => {
    setVkUser(null);
    localStorage.removeItem('vk_user');
    loadGiveaways();
  };

  const handleJoinGiveaway = async (giveawayId: number) => {
    if (!vkUser) {
      alert('Для участия в розыгрыше нужно войти через VK');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(GIVEAWAYS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giveaway_id: giveawayId,
          vk_id: vkUser.id
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Вы успешно участвуете в розыгрыше!');
        loadGiveaways();
      } else {
        alert(data.error || 'Ошибка при участии в розыгрыше');
      }
    } catch (error) {
      console.error('Error joining giveaway:', error);
      alert('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  const steamKeys = [
    { id: 1, game: 'CS2 Prime Status', price: 1200, discount: 15, inStock: true, image: '🔑' },
    { id: 2, game: 'Valorant VP 5000', price: 3500, discount: 0, inStock: true, image: '🎯' },
    { id: 3, game: 'Dota 2 Arcana Pack', price: 2800, discount: 20, inStock: true, image: '⚔️' },
    { id: 4, game: 'PUBG G-Coin 6000', price: 4200, discount: 10, inStock: true, image: '🔫' },
    { id: 5, game: 'Steam Wallet 1000₽', price: 1000, discount: 5, inStock: true, image: '💰' },
    { id: 6, game: 'Elden Ring', price: 2500, discount: 0, inStock: false, image: '🗡️' },
  ];

  const navItems = [
    { id: 'home', label: 'Главная', icon: 'Home' },
    { id: 'stream', label: 'Стрим', icon: 'Tv' },
    { id: 'giveaways', label: 'Розыгрыши', icon: 'Gift' },
    { id: 'schedule', label: 'Расписание', icon: 'Calendar' },
    { id: 'about', label: 'О стримере', icon: 'User' },
    { id: 'market', label: 'Маркет', icon: 'ShoppingCart' },
    { id: 'contacts', label: 'Контакты', icon: 'Mail' },
  ];

  const handleGiveawaySubmit = (giveawayId: number) => {
    if (giveawayEmail) {
      alert(`Вы участвуете в розыгрыше #${giveawayId}!`);
      setGiveawayEmail('');
    }
  };

  const handleBuyKey = (keyId: number, gameName: string) => {
    alert(`Покупка ключа: ${gameName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-card/80 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl animate-glow">
                🎮
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Skuff4ik
              </span>
            </div>
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  onClick={() => setActiveSection(item.id)}
                  className="transition-all duration-300"
                >
                  <Icon name={item.icon as any} size={16} className="mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              {vkUser ? (
                <div className="flex items-center space-x-2">
                  <img src={vkUser.photo_200} alt="Avatar" className="w-8 h-8 rounded-full" />
                  <span className="hidden md:inline text-sm">{vkUser.first_name}</span>
                  <Button variant="ghost" size="sm" onClick={handleVKLogout}>
                    <Icon name="LogOut" size={16} />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={handleVKLogin} disabled={isLoading}>
                  <Icon name="LogIn" size={16} className="mr-2" />
                  Войти через VK
                </Button>
              )}
              <Button variant="outline" className="md:hidden" onClick={() => setActiveSection('stream')}>
                <Icon name="Menu" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeSection === 'home' && (
          <div className="space-y-8 animate-fade-in">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-8 md:p-16">
              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <Badge className="bg-primary/20 text-primary border-primary">
                    <Icon name="Radio" size={14} className="mr-1" />
                    LIVE СЕЙЧАС
                  </Badge>
                  <h1 className="text-5xl md:text-7xl font-black leading-tight">
                    Добро пожаловать на{' '}
                    <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      стрим!
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Valorant, PUBG, Dota 2, CS2 — лучшие моменты и розыгрыши каждый день
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {games.map((game) => (
                      <Badge key={game.name} variant="outline" className="text-lg py-2 px-4">
                        {game.icon} {game.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all"
                      onClick={() => setActiveSection('stream')}
                    >
                      <Icon name="PlayCircle" size={20} className="mr-2" />
                      Смотреть стрим
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setActiveSection('giveaways')}
                    >
                      <Icon name="Gift" size={20} className="mr-2" />
                      Розыгрыши
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-20 blur-3xl rounded-full"></div>
                  <img
                    src="https://cdn.poehali.dev/projects/dcd5bdfc-bef9-4105-8aaf-88d2bb2bdb02/files/a5e78e05-02b0-4bef-b7f3-c4a250eee39d.jpg"
                    alt="Streamer Avatar"
                    className="relative rounded-3xl shadow-2xl animate-glow"
                  />
                </div>
              </div>
            </section>

            <section className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <Icon name="Users" size={32} className="text-primary mb-2" />
                  <CardTitle>12.5K</CardTitle>
                  <CardDescription>Подписчиков</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-card to-card/50 border-secondary/20 hover:border-secondary/50 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <Icon name="Trophy" size={32} className="text-secondary mb-2" />
                  <CardTitle>234</CardTitle>
                  <CardDescription>Проведено стримов</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-card to-card/50 border-accent/20 hover:border-accent/50 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <Icon name="Gift" size={32} className="text-accent mb-2" />
                  <CardTitle>45</CardTitle>
                  <CardDescription>Розыгрышей</CardDescription>
                </CardHeader>
              </Card>
            </section>
          </div>
        )}

        {activeSection === 'stream' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold">
                <Icon name="Tv" size={36} className="inline mr-3 text-primary" />
                Прямой эфир
              </h2>
              <Badge className="bg-red-500 animate-pulse">
                <Icon name="Radio" size={14} className="mr-1" />
                LIVE
              </Badge>
            </div>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative pb-[56.25%] bg-black">
                  <iframe
                    src="https://vkvideo.ru/video_ext.php?oid=-215330539&id=456239017&hd=2"
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>О текущем стриме</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  🎯 Сегодня играем в Valorant! Катаем рейтинг, общаемся с чатом и разыгрываем скины.
                  Не забудь подписаться и поставить лайк!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'giveaways' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold">
                <Icon name="Gift" size={36} className="inline mr-3 text-secondary" />
                Активные розыгрыши
              </h2>
              {!vkUser && (
                <Badge variant="outline" className="text-orange-500 border-orange-500">
                  <Icon name="AlertCircle" size={14} className="mr-1" />
                  Войдите через VK для участия
                </Badge>
              )}
            </div>
            {giveaways.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Загрузка розыгрышей...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {giveaways.map((giveaway) => (
                  <Card key={giveaway.id} className="bg-gradient-to-br from-card to-card/50 border-secondary/20 hover:border-secondary transition-all duration-300 hover:scale-105">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{giveaway.title}</CardTitle>
                        {giveaway.isParticipating && (
                          <Badge className="bg-green-500">
                            <Icon name="Check" size={14} className="mr-1" />
                            Участвуете
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Приз: <span className="text-secondary font-semibold">{giveaway.prize}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Участников:</span>
                        <span className="font-semibold">{giveaway.participants}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">До окончания:</span>
                        <span className="font-semibold">{giveaway.endDate}</span>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-secondary"
                        onClick={() => handleJoinGiveaway(giveaway.id)}
                        disabled={!vkUser || giveaway.isParticipating || isLoading}
                      >
                        {!vkUser ? (
                          <>
                            <Icon name="Lock" size={18} className="mr-2" />
                            Требуется авторизация
                          </>
                        ) : giveaway.isParticipating ? (
                          <>
                            <Icon name="Check" size={18} className="mr-2" />
                            Уже участвуете
                          </>
                        ) : (
                          <>
                            <Icon name="Gift" size={18} className="mr-2" />
                            Участвовать
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'schedule' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-4xl font-bold">
              <Icon name="Calendar" size={36} className="inline mr-3 text-accent" />
              Расписание стримов
            </h2>
            <div className="grid gap-4">
              {schedule.map((day, index) => (
                <Card
                  key={index}
                  className="bg-gradient-to-r from-card to-card/50 border-l-4 border-accent hover:border-primary transition-all duration-300 hover:scale-102"
                >
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{day.day}</div>
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {day.game}
                        </Badge>
                        <div className="flex items-center text-muted-foreground">
                          <Icon name="Clock" size={16} className="mr-2" />
                          {day.time}
                        </div>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={24} className="text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-4xl font-bold">
              <Icon name="User" size={36} className="inline mr-3 text-primary" />
              О стримере
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-8">
                  <img
                    src="https://cdn.poehali.dev/projects/dcd5bdfc-bef9-4105-8aaf-88d2bb2bdb02/files/a5e78e05-02b0-4bef-b7f3-c4a250eee39d.jpg"
                    alt="Streamer"
                    className="rounded-2xl shadow-2xl mb-6"
                  />
                </CardContent>
              </Card>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skuff4ik</CardTitle>
                    <CardDescription>Про-игрок и стример</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Привет! Я — страстный геймер с многолетним опытом в киберспорте.
                      Стримлю Valorant, CS2, Dota 2 и PUBG. Люблю общаться с аудиторией
                      и делиться своим опытом.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Icon name="Trophy" size={20} className="mr-3 text-primary" />
                        <span>Участник турниров по Valorant и CS2</span>
                      </div>
                      <div className="flex items-center">
                        <Icon name="Users" size={20} className="mr-3 text-secondary" />
                        <span>12.5K+ подписчиков на платформе</span>
                      </div>
                      <div className="flex items-center">
                        <Icon name="Award" size={20} className="mr-3 text-accent" />
                        <span>45+ успешных розыгрышей</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Любимые игры</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {games.map((game) => (
                        <Badge key={game.name} variant="outline" className="text-lg py-2 px-4">
                          {game.icon} {game.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'market' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold">
                <Icon name="ShoppingCart" size={36} className="inline mr-3 text-primary" />
                Маркет Steam ключей
              </h2>
              <Badge className="bg-gradient-to-r from-primary to-secondary text-lg px-4 py-2">
                <Icon name="Zap" size={16} className="mr-1" />
                Мгновенная доставка
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steamKeys.map((key) => {
                const finalPrice = key.discount > 0 ? key.price - (key.price * key.discount / 100) : key.price;
                return (
                  <Card key={key.id} className="bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary transition-all duration-300 hover:scale-105 relative overflow-hidden">
                    {key.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                        -{key.discount}%
                      </div>
                    )}
                    {!key.inStock && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg px-4 py-2">
                          Нет в наличии
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="text-6xl mb-4 text-center">{key.image}</div>
                      <CardTitle className="text-center">{key.game}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {key.discount > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-bold text-primary">{finalPrice}₽</span>
                            <span className="text-lg text-muted-foreground line-through">{key.price}₽</span>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-center text-primary">{key.price}₽</div>
                        )}
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-secondary"
                        disabled={!key.inStock}
                        onClick={() => handleBuyKey(key.id, key.game)}
                      >
                        <Icon name="ShoppingBag" size={18} className="mr-2" />
                        {key.inStock ? 'Купить ключ' : 'Недоступно'}
                      </Button>
                      <div className="flex items-center justify-center text-xs text-muted-foreground">
                        <Icon name="Shield" size={14} className="mr-1" />
                        Гарантия подлинности
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icon name="Info" size={24} className="mr-2 text-primary" />
                  Как купить ключ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                      1
                    </div>
                    <h3 className="font-semibold">Выберите товар</h3>
                    <p className="text-sm text-muted-foreground">
                      Нажмите "Купить ключ" на понравившемся товаре
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-xl font-bold">
                      2
                    </div>
                    <h3 className="font-semibold">Оплатите</h3>
                    <p className="text-sm text-muted-foreground">
                      Безопасная оплата через защищенную систему
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold">
                      3
                    </div>
                    <h3 className="font-semibold">Получите ключ</h3>
                    <p className="text-sm text-muted-foreground">
                      Мгновенная доставка на указанный email
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'contacts' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-4xl font-bold">
              <Icon name="Mail" size={36} className="inline mr-3 text-accent" />
              Контакты
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Свяжитесь со мной</CardTitle>
                  <CardDescription>Буду рад вашим сообщениям и предложениям</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Имя</label>
                    <Input placeholder="Ваше имя" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Сообщение</label>
                    <Textarea placeholder="Ваше сообщение..." rows={5} />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить
                  </Button>
                </CardContent>
              </Card>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Социальные сети</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <a
                      href="https://live.vkvideo.ru/skuff4ik"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 rounded-lg bg-muted hover:bg-muted/70 transition-all duration-300 hover:scale-105"
                    >
                      <Icon name="Video" size={24} className="mr-4 text-primary" />
                      <div>
                        <div className="font-semibold">VK Live</div>
                        <div className="text-sm text-muted-foreground">live.vkvideo.ru/skuff4ik</div>
                      </div>
                    </a>
                    <a
                      href="#"
                      className="flex items-center p-4 rounded-lg bg-muted hover:bg-muted/70 transition-all duration-300 hover:scale-105"
                    >
                      <Icon name="MessageCircle" size={24} className="mr-4 text-secondary" />
                      <div>
                        <div className="font-semibold">Telegram</div>
                        <div className="text-sm text-muted-foreground">@skuff4ik</div>
                      </div>
                    </a>
                    <a
                      href="#"
                      className="flex items-center p-4 rounded-lg bg-muted hover:bg-muted/70 transition-all duration-300 hover:scale-105"
                    >
                      <Icon name="Share2" size={24} className="mr-4 text-accent" />
                      <div>
                        <div className="font-semibold">Discord</div>
                        <div className="text-sm text-muted-foreground">Skuff4ik#1234</div>
                      </div>
                    </a>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>По вопросам сотрудничества</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Открыт для рекламных интеграций и партнерства
                    </p>
                    <Button variant="outline" className="w-full">
                      <Icon name="Briefcase" size={18} className="mr-2" />
                      Коммерческие предложения
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-border bg-card/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
                🎮
              </div>
              <span className="font-bold">Skuff4ik © 2025</span>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">
                <Icon name="Video" size={18} />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="MessageCircle" size={18} />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Share2" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;