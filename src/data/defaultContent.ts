import type { LocalizedText, SiteContent } from '../types'

export const languageNames: Record<keyof LocalizedText, string> = {
  en: 'English',
  ar: 'العربية',
  ku: 'کوردیی سۆرانی',
}

export const defaultContent: SiteContent = {
  designerName: {
    en: 'NOVA Studio',
    ar: 'استوديو نوفا',
    ku: 'ستۆدیۆی نۆڤا',
  },
  role: {
    en: 'Photoshop & Blender Designer',
    ar: 'مصمم فوتوشوب وبلندر',
    ku: 'دیزاینەری فۆتۆشۆپ و بلێندەر',
  },
  intro: {
    en: 'Cinematic visuals, 3D product worlds, thumbnails, logos, and social campaigns built with neon precision.',
    ar: 'تصاميم سينمائية، عوالم ثلاثية الأبعاد للمنتجات، صور مصغرة، شعارات، وحملات سوشيال مصممة بدقة نيونية.',
    ku: 'دیمەنی سینەمایی، جیهانی سێ ڕەهەندی بۆ بەرهەمەکان، وێنەی بچووک، لۆگۆ و کەمپەینی سۆشیال بە وردیی نیۆن دروست دەکرێن.',
  },
  profileImage:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=720&q=90',
  aboutTitle: {
    en: 'Designing impossible worlds for brands, creators, and games.',
    ar: 'تصميم عوالم لا تُنسى للعلامات التجارية وصناع المحتوى والألعاب.',
    ku: 'دیزاینی جیهانی بیرنەکراو بۆ براند، دروستکەرانی ناوەڕۆک و یارییەکان.',
  },
  aboutText: {
    en: 'I combine Photoshop compositing, Blender lighting, hard-surface modeling, and cinematic color grading to create portfolio pieces that feel premium, sharp, and memorable across every screen.',
    ar: 'أمزج بين تركيب الصور في فوتوشوب، إضاءة بلندر، نمذجة الأسطح الصلبة، وتلوين سينمائي لصناعة أعمال فاخرة، حادة، وسهلة التذكر على كل شاشة.',
    ku: 'تێکەڵی کۆم پۆزیتی فۆتۆشۆپ، ڕووناکیی بلێندەر، مۆدێلکردنی سەخت و ڕەنگدانەوەی سینەمایی دەکەم بۆ دروستکردنی کارێکی پیشەیی، ورد و لەبیرنەکراو لەسەر هەموو شاشەیەک.',
  },
  categories: [
    { id: 'photoshop', label: { en: 'Photoshop', ar: 'فوتوشوب', ku: 'فۆتۆشۆپ' } },
    { id: 'blender', label: { en: 'Blender', ar: 'بلندر', ku: 'بلێندەر' } },
    { id: 'social-media', label: { en: 'Social Media', ar: 'سوشيال ميديا', ku: 'سۆشیال میدیا' } },
    { id: 'logos', label: { en: 'Logos', ar: 'شعارات', ku: 'لۆگۆ' } },
  ],
  stats: [
    { label: { en: 'Completed projects', ar: 'مشروع مكتمل', ku: 'پڕۆژەی تەواوکراو' }, value: 128, suffix: '+' },
    { label: { en: 'Years crafting visuals', ar: 'سنوات خبرة بصرية', ku: 'ساڵ ئەزموونی بینراو' }, value: 6, suffix: '+' },
    { label: { en: 'Average delivery score', ar: 'متوسط رضا التسليم', ku: 'تێکڕای ڕەزامەندیی گەیاندن' }, value: 98, suffix: '%' },
  ],
  skills: [
    {
      name: { en: 'Photoshop Compositing', ar: 'تركيب احترافي بفوتوشوب', ku: 'کۆم پۆزیتی پیشەیی بە فۆتۆشۆپ' },
      detail: {
        en: 'Poster art, retouching, cinematic grading, and ad creatives.',
        ar: 'بوسترات، ريتاتش، تلوين سينمائي، وتصاميم إعلانية عالية التأثير.',
        ku: 'پۆستەر، ڕیتاچ، ڕەنگدانەوەی سینەمایی و دیزاینی ڕیکلامی کاریگەر.',
      },
      level: 96,
    },
    {
      name: { en: 'Blender Worlds', ar: 'عوالم بلندر ثلاثية الأبعاد', ku: 'جیهانی سێ ڕەهەندیی بلێندەر' },
      detail: {
        en: 'Lighting, modeling, product scenes, motion-ready renders.',
        ar: 'إضاءة، نمذجة، مشاهد منتجات، ورندرات جاهزة للتحريك.',
        ku: 'ڕووناکی، مۆدێلکردن، دیمەنی بەرهەم و ڕێندەری ئامادە بۆ جووڵە.',
      },
      level: 91,
    },
    {
      name: { en: 'Creator Branding', ar: 'هوية صناع المحتوى', ku: 'ناسنامەی دروستکەرانی ناوەڕۆک' },
      detail: {
        en: 'YouTube thumbnails, stream packs, logos, and launch visuals.',
        ar: 'صور يوتيوب مصغرة، حزم بث، شعارات، ومواد إطلاق احترافية.',
        ku: 'وێنەی بچووکی یوتیوب، پاکێجی ستریم، لۆگۆ و بینراوی دەستپێکردن.',
      },
      level: 88,
    },
  ],
  projects: [
    {
      id: 'project-aurora',
      title: { en: 'Aurora Runner Campaign', ar: 'حملة عداء الشفق', ku: 'کەمپەینی ڕاکەری ئاوروورا' },
      category: 'photoshop',
      description: {
        en: 'A kinetic cyberpunk poster system with layered light trails and dramatic grading.',
        ar: 'نظام بوسترات سايبربنك ديناميكي بمسارات ضوئية متعددة وتلوين درامي.',
        ku: 'سیستەمی پۆستەری سایبەرپانکی جووڵاو بە هێڵی ڕووناکیی چینەچین و ڕەنگدانەوەی دراماتیکی.',
      },
      image:
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1100&q=90',
      tools: ['Photoshop', 'Lightroom'],
    },
    {
      id: 'project-core',
      title: { en: 'Quantum Core Render', ar: 'رندر النواة الكمية', ku: 'ڕێندەری ناوکی کوانتەم' },
      category: 'blender',
      description: {
        en: 'A reflective product environment designed for a premium hardware concept.',
        ar: 'بيئة منتج عاكسة مصممة لمفهوم جهاز فاخر.',
        ku: 'ژینگەی بەرهەمێکی ڕەنگدانەوەدار بۆ بیرۆکەی هاردوێری فاخیر.',
      },
      image:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1100&q=90',
      tools: ['Blender', 'Cycles'],
    },
    {
      id: 'project-avatar',
      title: { en: 'Neon Avatar Pack', ar: 'حزمة أفاتارات نيون', ku: 'پاکێجی ئەڤاتاری نیۆن' },
      category: 'blender',
      description: {
        en: 'Stylized creator avatars with volumetric glow and collectible presentation frames.',
        ar: 'أفاتارات مخصصة لصناع المحتوى مع توهج حجمي وإطارات عرض قابلة للتجميع.',
        ku: 'ئەڤاتاری ستایلکراو بۆ دروستکەران بە گڵۆی قەبارەیی و چوارچێوەی پیشاندانی کۆکردنەوە.',
      },
      image:
        'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?auto=format&fit=crop&w=1100&q=90',
      tools: ['Blender', 'Photoshop'],
    },
    {
      id: 'project-thumbnail',
      title: { en: 'Viral Challenge Thumbnail', ar: 'صورة مصغرة لتحدي فيروسي', ku: 'وێنەی بچووکی چالێنجی بەناوبانگ' },
      category: 'social-media',
      description: {
        en: 'High-contrast YouTube thumbnail composition built for mobile click-through.',
        ar: 'تصميم صورة يوتيوب مصغرة بتباين قوي ومهيأ للنقر على الهاتف.',
        ku: 'کۆم پۆزیتی وێنەی بچووکی یوتیوب بە کۆنتراستی بەرز بۆ کلیکی مۆبایل.',
      },
      image:
        'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1100&q=90',
      tools: ['Photoshop'],
    },
    {
      id: 'project-orbit',
      title: { en: 'Orbit Logo System', ar: 'نظام شعار أوربت', ku: 'سیستەمی لۆگۆی ئۆربیت' },
      category: 'logos',
      description: {
        en: 'A sharp identity direction with chrome type, orbit marks, and animated reveals.',
        ar: 'اتجاه هوية حاد مع كتابة كروم، علامات مدارية، وكشفات متحركة.',
        ku: 'ئاراستەی ناسنامەیەکی تیژ بە نووسینی کرۆم، نیشانەی سووڕانەوە و ئاشکراکردنی جووڵاو.',
      },
      image:
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1100&q=90',
      tools: ['Illustrator', 'Photoshop'],
    },
    {
      id: 'project-mech',
      title: { en: 'Mech Bay Matte Paint', ar: 'رسم مات لمرسى آلي', ku: 'مەیت پەینتی بای مەک' },
      category: 'photoshop',
      description: {
        en: 'Large-scale sci-fi environment matte painting with fog, scale, and hero lighting.',
        ar: 'بيئة خيال علمي واسعة بأسلوب matte painting مع ضباب وإحساس ضخم وإضاءة بطولية.',
        ku: 'مەیت پەینتی ژینگەی سای-فای بە قەبارەی گەورە، تەم، هەستی قەبارە و ڕووناکیی پاڵەوانی.',
      },
      image:
        'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1100&q=90',
      tools: ['Photoshop', 'Blender'],
    },
    {
      id: 'project-cosmos',
      title: { en: 'Cosmos Brand Poster', ar: 'بوستر كوزموس للعلامة التجارية', ku: 'پۆستەری براندی کۆزمۆس' },
      category: 'photoshop',
      description: {
        en: 'A celestial composition with nebula gradients, text overlays, and signature neon glow.',
        ar: 'تركيب سماوي مع تدرجات سديمية، تراكبات نصوص، وتوهج نيوني مميز.',
        ku: 'کۆم پۆزیتی ئاسمانی بە گریادەنی نیبۆلا، ڕووپۆشینی نووسین و گڵۆی نیۆنی ناسراو.',
      },
      image:
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1100&q=90',
      tools: ['Photoshop'],
    },
    {
      id: 'project-render-wave',
      title: { en: 'Waveform Product Render', ar: 'رندر منتج بشكل موجة', ku: 'ڕێندەری بەرهەمی شێوە شەپۆل' },
      category: 'blender',
      description: {
        en: 'Procedural wave surface with glass material and studio lighting for a modern product shot.',
        ar: 'سطح موجي إجرائي بمادة زجاجية وإضاءة استوديو للتصوير العصري للمنتجات.',
        ku: 'ڕووی شەپۆلی پرۆسیداڵ بە مادەی شووشە و ڕووناکی ستودیۆ بۆ وێنەی بەرهەمی مۆدێرن.',
      },
      image:
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1100&q=90',
      tools: ['Blender', 'Cycles', 'Photoshop'],
    },
    {
      id: 'project-thumb-pack',
      title: { en: 'Gaming Thumbnail Pack', ar: 'حزمة صور مصغرة للألعاب', ku: 'پاکێجی وێنەی بچووکی یاری' },
      category: 'social-media',
      description: {
        en: 'A set of high-impact gaming thumbnails with layered text, glow strokes, and action frames.',
        ar: 'مجموعة صور مصغرة للألعاب عالية التأثير مع نصوص متعددة، حدود مضيئة، وإطارات حركية.',
        ku: 'کۆمەڵێک وێنەی بچووکی یاریی کاریگەر بە نووسینی چینەچین، هێڵی بریقەدار و چوارچێوەی جووڵە.',
      },
      image:
        'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=1100&q=90',
      tools: ['Photoshop'],
    },
    {
      id: 'project-logo-future',
      title: { en: 'Future Mark Logo', ar: 'شعار علامة المستقبل', ku: 'لۆگۆی نیشانی داهاتوو' },
      category: 'logos',
      description: {
        en: 'Minimalist technology logo with geometric cuts, cyan gradients, and negative space play.',
        ar: 'شعار تكنولوجيا بسيط بقصات هندسية، تدرجات سيان، ولعب بالمساحة السلبية.',
        ku: 'لۆگۆی تەکنەلۆژیای مینیمال بە بڕینی ئەندازەیی، گریادەنی سیان و یاری بە بۆشایی نەرێنی.',
      },
      image:
        'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=1100&q=90',
      tools: ['Illustrator', 'Photoshop'],
    },
  ],
  galleryLayout: [],
  socials: [
    { id: 'tiktok', label: { en: 'TikTok', ar: 'تيك توك', ku: 'تیکتۆک' }, handle: '@novastudio', url: 'https://www.tiktok.com/', icon: 'TT' },
    {
      id: 'instagram',
      label: { en: 'Instagram', ar: 'إنستغرام', ku: 'ئینستاگرام' },
      handle: '@novastudio',
      url: 'https://www.instagram.com/',
      icon: 'IG',
    },
    { id: 'youtube', label: { en: 'YouTube', ar: 'يوتيوب', ku: 'یوتیوب' }, handle: '@novastudio', url: 'https://www.youtube.com/', icon: 'YT' },
    { id: 'discord', label: { en: 'Discord', ar: 'ديسكورد', ku: 'دیسکۆرد' }, handle: 'nova.design', url: 'https://discord.com/', icon: 'DC' },
    { id: 'telegram', label: { en: 'Telegram', ar: 'تيليغرام', ku: 'تێلیگرام' }, handle: '@novastudio', url: 'https://telegram.org/', icon: 'TG' },
  ],
  contact: {
    email: 'hello@novastudio.design',
    whatsapp: '+964 770 000 0000',
    discord: 'nova.design',
  },
}
