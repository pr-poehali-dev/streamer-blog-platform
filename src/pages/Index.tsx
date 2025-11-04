import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [giveawayEmail, setGiveawayEmail] = useState('');

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

  const giveaways = [
    { id: 1, title: 'Скины Valorant', prize: 'VP 2000', endDate: '15.11.2025', participants: 234 },
    { id: 2, title: 'Набор CS2', prize: 'Нож Karambit', endDate: '20.11.2025', participants: 567 },
    { id: 3, title: 'Battle Pass Dota 2', prize: 'Arcana', endDate: '25.11.2025', participants: 189 },
  ];

  const navItems = [
    { id: 'home', label: 'Главная', icon: 'Home' },
    { id: 'stream', label: 'Стрим', icon: 'Tv' },
    { id: 'giveaways', label: 'Розыгрыши', icon: 'Gift' },
    { id: 'schedule', label: 'Расписание', icon: 'Calendar' },
    { id: 'about', label: 'О стримере', icon: 'User' },
    { id: 'contacts', label: 'Контакты', icon: 'Mail' },
  ];

  const handleGiveawaySubmit = (giveawayId: number) => {
    if (giveawayEmail) {
      alert(`Вы участвуете в розыгрыше #${giveawayId}!`);
      setGiveawayEmail('');
    }
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
            <Button variant="outline" className="md:hidden" onClick={() => setActiveSection('stream')}>
              <Icon name="Menu" size={20} />
            </Button>
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
            <h2 className="text-4xl font-bold">
              <Icon name="Gift" size={36} className="inline mr-3 text-secondary" />
              Активные розыгрыши
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {giveaways.map((giveaway) => (
                <Card key={giveaway.id} className="bg-gradient-to-br from-card to-card/50 border-secondary/20 hover:border-secondary transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <CardTitle>{giveaway.title}</CardTitle>
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
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Ваш Email"
                        value={giveawayEmail}
                        onChange={(e) => setGiveawayEmail(e.target.value)}
                      />
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-secondary"
                        onClick={() => handleGiveawaySubmit(giveaway.id)}
                      >
                        Участвовать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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