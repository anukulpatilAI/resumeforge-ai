import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const templates = [
  {
    name: 'ATS Classic',
    slug: 'ats-classic',
    templateJson: {
      fonts: { heading: 'Inter', body: 'Inter' },
      colors: { primary: '#1a1a2e', background: '#ffffff', text: '#333333', accent: '#0f3460' },
      spacing: { sectionGap: 16, itemGap: 8, marginX: 48, marginY: 36 },
      layout: 'single-column', showPhoto: true, photoStyle: 'circle',
      sectionStyle: 'underline-headers', headerLayout: 'banner', skillStyle: 'pill', sectionDivider: 'space',
      colorOptions: [
        { name: 'Navy', colors: { primary: '#1a1a2e', background: '#fff', text: '#333', accent: '#0f3460', banner: '#1a1a2e', bannerText: '#fff' } },
        { name: 'Teal', colors: { primary: '#0D9488', background: '#fff', text: '#333', accent: '#0F766E', banner: '#0D9488', bannerText: '#fff' } },
        { name: 'Charcoal', colors: { primary: '#1E293B', background: '#fff', text: '#333', accent: '#475569', banner: '#1E293B', bannerText: '#fff' } },
      ],
    },
  },
  {
    name: 'Modern',
    slug: 'modern',
    templateJson: {
      fonts: { heading: 'Poppins', body: 'Inter' },
      colors: { primary: '#2563eb', background: '#ffffff', text: '#1e293b', accent: '#7c3aed', sidebar: '#F8FAFC', sidebarText: '#1e293b' },
      spacing: { sectionGap: 20, itemGap: 10, marginX: 40, marginY: 32 },
      layout: 'two-column', showPhoto: true, photoStyle: 'circle',
      sectionStyle: 'icon-headers', headerLayout: 'sidebar', photoPosition: 'left', skillStyle: 'pill', sectionDivider: 'space',
      colorOptions: [
        { name: 'Default', colors: { primary: '#2563eb', background: '#fff', text: '#1e293b', accent: '#7c3aed', sidebar: '#F8FAFC', sidebarText: '#1e293b' } },
        { name: 'Forest', colors: { primary: '#059669', background: '#fff', text: '#1e293b', accent: '#D97706', sidebar: '#ECFDF5', sidebarText: '#1e293b' } },
        { name: 'Rose', colors: { primary: '#E11D48', background: '#fff', text: '#1e293b', accent: '#7C3AED', sidebar: '#FFF1F2', sidebarText: '#1e293b' } },
      ],
    },
  },
  {
    name: 'Minimal',
    slug: 'minimal',
    templateJson: {
      fonts: { heading: 'Georgia', body: 'Merriweather' },
      colors: { primary: '#2d2d2d', background: '#fafafa', text: '#444444', accent: '#888888' },
      spacing: { sectionGap: 24, itemGap: 12, marginX: 56, marginY: 44 },
      layout: 'single-column', showPhoto: false, photoStyle: 'circle',
      sectionStyle: 'minimal-headers', headerLayout: 'left', skillStyle: 'list', sectionDivider: 'space',
      colorOptions: [
        { name: 'Gray', colors: { primary: '#2d2d2d', background: '#fafafa', text: '#444', accent: '#888' } },
        { name: 'Warm', colors: { primary: '#5C4033', background: '#FEFCF5', text: '#4A4A4A', accent: '#B8860B' } },
        { name: 'Slate', colors: { primary: '#334155', background: '#F8FAFC', text: '#475569', accent: '#94A3B8' } },
      ],
    },
  },
  {
    name: 'Executive',
    slug: 'executive',
    templateJson: {
      fonts: { heading: 'Playfair Display', body: 'Lato' },
      colors: { primary: '#1B1B2F', background: '#FFFFFF', text: '#333333', accent: '#C5A55A', banner: '#1B1B2F', bannerText: '#FFFFFF' },
      spacing: { sectionGap: 20, itemGap: 10, marginX: 50, marginY: 40 },
      layout: 'single-column', showPhoto: true, photoStyle: 'circle',
      sectionStyle: 'underline-headers', headerLayout: 'banner', skillStyle: 'list', sectionDivider: 'line',
      colorOptions: [
        { name: 'Gold', colors: { primary: '#1B1B2F', background: '#fff', text: '#333', accent: '#C5A55A', banner: '#1B1B2F', bannerText: '#fff' } },
        { name: 'Navy', colors: { primary: '#0F172A', background: '#fff', text: '#333', accent: '#3B82F6', banner: '#0F172A', bannerText: '#fff' } },
        { name: 'Burgundy', colors: { primary: '#2D1B1B', background: '#fff', text: '#333', accent: '#B8860B', banner: '#2D1B1B', bannerText: '#fff' } },
      ],
    },
  },
  {
    name: 'Clean',
    slug: 'clean',
    templateJson: {
      fonts: { heading: 'Inter', body: 'Inter' },
      colors: { primary: '#334155', background: '#FFFFFF', text: '#475569', accent: '#3B82F6' },
      spacing: { sectionGap: 18, itemGap: 8, marginX: 52, marginY: 38 },
      layout: 'single-column', showPhoto: false, photoStyle: 'circle',
      sectionStyle: 'underline-headers', headerLayout: 'centered', skillStyle: 'pill', sectionDivider: 'line',
      colorOptions: [
        { name: 'Blue', colors: { primary: '#334155', background: '#fff', text: '#475569', accent: '#3B82F6' } },
        { name: 'Green', colors: { primary: '#334155', background: '#fff', text: '#475569', accent: '#10B981' } },
        { name: 'Violet', colors: { primary: '#334155', background: '#fff', text: '#475569', accent: '#8B5CF6' } },
      ],
    },
  },
  {
    name: 'Bold',
    slug: 'bold',
    templateJson: {
      fonts: { heading: 'Montserrat', body: 'Inter' },
      colors: { primary: '#1E1E1E', background: '#FFFFFF', text: '#2D2D2D', accent: '#0D9488', banner: '#1E1E1E', bannerText: '#FFFFFF' },
      spacing: { sectionGap: 22, itemGap: 10, marginX: 44, marginY: 36 },
      layout: 'single-column', showPhoto: true, photoStyle: 'square',
      sectionStyle: 'minimal-headers', headerLayout: 'banner', skillStyle: 'bar', sectionDivider: 'space',
      colorOptions: [
        { name: 'Teal', colors: { primary: '#1E1E1E', background: '#fff', text: '#2D2D2D', accent: '#0D9488', banner: '#1E1E1E', bannerText: '#fff' } },
        { name: 'Orange', colors: { primary: '#1E1E1E', background: '#fff', text: '#2D2D2D', accent: '#EA580C', banner: '#1E1E1E', bannerText: '#fff' } },
        { name: 'Indigo', colors: { primary: '#1E1E1E', background: '#fff', text: '#2D2D2D', accent: '#6366F1', banner: '#1E1E1E', bannerText: '#fff' } },
      ],
    },
  },
  {
    name: 'Compact',
    slug: 'compact',
    templateJson: {
      fonts: { heading: 'Inter', body: 'Inter' },
      colors: { primary: '#1E293B', background: '#FFFFFF', text: '#334155', accent: '#64748B' },
      spacing: { sectionGap: 12, itemGap: 6, marginX: 36, marginY: 24 },
      layout: 'single-column', showPhoto: false, photoStyle: 'circle',
      sectionStyle: 'minimal-headers', headerLayout: 'compact', skillStyle: 'list', sectionDivider: 'line',
      colorOptions: [
        { name: 'Slate', colors: { primary: '#1E293B', background: '#fff', text: '#334155', accent: '#64748B' } },
        { name: 'Stone', colors: { primary: '#44403C', background: '#fff', text: '#44403C', accent: '#A8A29E' } },
      ],
    },
  },
  {
    name: 'Creative',
    slug: 'creative',
    templateJson: {
      fonts: { heading: 'Space Grotesk', body: 'Inter' },
      colors: { primary: '#6D28D9', background: '#FFFFFF', text: '#1E1E2E', accent: '#EC4899' },
      spacing: { sectionGap: 20, itemGap: 10, marginX: 44, marginY: 36 },
      layout: 'single-column', showPhoto: true, photoStyle: 'circle',
      sectionStyle: 'icon-headers', headerLayout: 'centered', skillStyle: 'grid', sectionDivider: 'dot',
      colorOptions: [
        { name: 'Purple', colors: { primary: '#6D28D9', background: '#fff', text: '#1E1E2E', accent: '#EC4899' } },
        { name: 'Cyan', colors: { primary: '#0891B2', background: '#fff', text: '#1E1E2E', accent: '#06B6D4' } },
        { name: 'Amber', colors: { primary: '#D97706', background: '#fff', text: '#1E1E2E', accent: '#F59E0B' } },
      ],
    },
  },
  {
    name: 'Header Bold',
    slug: 'header-bold',
    templateJson: {
      fonts: { heading: 'Oswald', body: 'Lato' },
      colors: { primary: '#0F172A', background: '#FFFFFF', text: '#1E293B', accent: '#06B6D4', banner: '#0F172A', bannerText: '#FFFFFF' },
      spacing: { sectionGap: 20, itemGap: 10, marginX: 48, marginY: 36 },
      layout: 'single-column', showPhoto: false, photoStyle: 'circle',
      sectionStyle: 'underline-headers', headerLayout: 'banner', skillStyle: 'bar', sectionDivider: 'space',
      colorOptions: [
        { name: 'Cyan', colors: { primary: '#0F172A', background: '#fff', text: '#1E293B', accent: '#06B6D4', banner: '#0F172A', bannerText: '#fff' } },
        { name: 'Rose', colors: { primary: '#0F172A', background: '#fff', text: '#1E293B', accent: '#F43F5E', banner: '#0F172A', bannerText: '#fff' } },
        { name: 'Lime', colors: { primary: '#0F172A', background: '#fff', text: '#1E293B', accent: '#65A30D', banner: '#0F172A', bannerText: '#fff' } },
      ],
    },
  },
  {
    name: 'Sidebar Pro',
    slug: 'sidebar-pro',
    templateJson: {
      fonts: { heading: 'Inter', body: 'Inter' },
      colors: { primary: '#1E293B', background: '#FFFFFF', text: '#334155', accent: '#3B82F6', sidebar: '#1E293B', sidebarText: '#FFFFFF' },
      spacing: { sectionGap: 18, itemGap: 8, marginX: 44, marginY: 34 },
      layout: 'two-column', showPhoto: true, photoStyle: 'circle',
      sectionStyle: 'underline-headers', headerLayout: 'sidebar', skillStyle: 'pill', sectionDivider: 'space',
      colorOptions: [
        { name: 'Slate', colors: { primary: '#1E293B', background: '#fff', text: '#334155', accent: '#3B82F6', sidebar: '#1E293B', sidebarText: '#fff' } },
        { name: 'Zinc', colors: { primary: '#27272A', background: '#fff', text: '#334155', accent: '#A1A1AA', sidebar: '#27272A', sidebarText: '#fff' } },
        { name: 'Stone', colors: { primary: '#44403C', background: '#fff', text: '#334155', accent: '#78716C', sidebar: '#44403C', sidebarText: '#fff' } },
      ],
    },
  },
  {
    name: 'Contrast',
    slug: 'contrast',
    templateJson: {
      fonts: { heading: 'Lato', body: 'Lato' },
      colors: { primary: '#1E3A5F', background: '#FFFFFF', text: '#2D3748', accent: '#E67E22', sidebar: '#EEF2FF', sidebarText: '#1E3A5F' },
      spacing: { sectionGap: 18, itemGap: 8, marginX: 40, marginY: 32 },
      layout: 'two-column', showPhoto: true, photoStyle: 'circle',
      sectionStyle: 'icon-headers', headerLayout: 'sidebar', photoPosition: 'right', skillStyle: 'pill', sectionDivider: 'space',
      colorOptions: [
        { name: 'Ocean', colors: { primary: '#1E3A5F', background: '#fff', text: '#2D3748', accent: '#E67E22', sidebar: '#EEF2FF', sidebarText: '#1E3A5F' } },
        { name: 'Emerald', colors: { primary: '#064E3B', background: '#fff', text: '#2D3748', accent: '#F59E0B', sidebar: '#ECFDF5', sidebarText: '#064E3B' } },
        { name: 'Ruby', colors: { primary: '#7F1D1D', background: '#fff', text: '#2D3748', accent: '#F97316', sidebar: '#FFF1F2', sidebarText: '#7F1D1D' } },
      ],
    },
  },
  {
    name: 'Timeline',
    slug: 'timeline',
    templateJson: {
      fonts: { heading: 'Source Sans Pro', body: 'Source Sans Pro' },
      colors: { primary: '#2C3E50', background: '#FFFFFF', text: '#34495E', accent: '#3498DB', sidebar: '#F1F5F9', sidebarText: '#2C3E50' },
      spacing: { sectionGap: 16, itemGap: 8, marginX: 40, marginY: 32 },
      layout: 'two-column', showPhoto: true, photoStyle: 'circle',
      sectionStyle: 'underline-headers', headerLayout: 'left', skillStyle: 'list', sectionDivider: 'line',
      colorOptions: [
        { name: 'Blue', colors: { primary: '#2C3E50', background: '#fff', text: '#34495E', accent: '#3498DB', sidebar: '#F1F5F9', sidebarText: '#2C3E50' } },
        { name: 'Green', colors: { primary: '#2C3E50', background: '#fff', text: '#34495E', accent: '#27AE60', sidebar: '#F1F5F9', sidebarText: '#2C3E50' } },
        { name: 'Purple', colors: { primary: '#2C3E50', background: '#fff', text: '#34495E', accent: '#8E44AD', sidebar: '#F1F5F9', sidebarText: '#2C3E50' } },
      ],
    },
  },
  {
    name: 'Profile',
    slug: 'profile',
    templateJson: {
      fonts: { heading: 'Nunito', body: 'Inter' },
      colors: { primary: '#1E40AF', background: '#FFFFFF', text: '#1E293B', accent: '#F59E0B', sidebar: '#EFF6FF', sidebarText: '#1E40AF' },
      spacing: { sectionGap: 18, itemGap: 8, marginX: 40, marginY: 32 },
      layout: 'two-column', showPhoto: true, photoStyle: 'circle',
      sectionStyle: 'underline-headers', headerLayout: 'sidebar', photoPosition: 'left', skillStyle: 'pill', sectionDivider: 'space',
      colorOptions: [
        { name: 'Blue', colors: { primary: '#1E40AF', background: '#fff', text: '#1E293B', accent: '#F59E0B', sidebar: '#EFF6FF', sidebarText: '#1E40AF' } },
        { name: 'Rose', colors: { primary: '#BE123C', background: '#fff', text: '#1E293B', accent: '#FCD34D', sidebar: '#FFF1F2', sidebarText: '#BE123C' } },
        { name: 'Teal', colors: { primary: '#0F766E', background: '#fff', text: '#1E293B', accent: '#F97316', sidebar: '#F0FDFA', sidebarText: '#0F766E' } },
      ],
    },
  },
  {
    name: 'Elegant',
    slug: 'elegant',
    templateJson: {
      fonts: { heading: 'Cormorant Garamond', body: 'Inter' },
      colors: { primary: '#831843', background: '#FFFFFF', text: '#4A1942', accent: '#DB2777', sidebar: '#FDF2F8', sidebarText: '#831843' },
      spacing: { sectionGap: 20, itemGap: 10, marginX: 44, marginY: 36 },
      layout: 'two-column', showPhoto: false, photoStyle: 'circle',
      sectionStyle: 'minimal-headers', headerLayout: 'sidebar', skillStyle: 'list', sectionDivider: 'space',
      colorOptions: [
        { name: 'Rose', colors: { primary: '#831843', background: '#fff', text: '#4A1942', accent: '#DB2777', sidebar: '#FDF2F8', sidebarText: '#831843' } },
        { name: 'Violet', colors: { primary: '#4C1D95', background: '#fff', text: '#3B0764', accent: '#7C3AED', sidebar: '#F5F3FF', sidebarText: '#4C1D95' } },
        { name: 'Emerald', colors: { primary: '#065F46', background: '#fff', text: '#064E3B', accent: '#10B981', sidebar: '#ECFDF5', sidebarText: '#065F46' } },
      ],
    },
  },
  {
    name: 'Technical',
    slug: 'technical',
    templateJson: {
      fonts: { heading: 'JetBrains Mono', body: 'Inter' },
      colors: { primary: '#0D1117', background: '#FFFFFF', text: '#24292F', accent: '#58A6FF', banner: '#0D1117', bannerText: '#C9D1D9' },
      spacing: { sectionGap: 16, itemGap: 8, marginX: 48, marginY: 36 },
      layout: 'single-column', showPhoto: false, photoStyle: 'square',
      sectionStyle: 'underline-headers', headerLayout: 'banner', skillStyle: 'list', sectionDivider: 'line',
      colorOptions: [
        { name: 'GitHub', colors: { primary: '#0D1117', background: '#fff', text: '#24292F', accent: '#58A6FF', banner: '#0D1117', bannerText: '#C9D1D9' } },
        { name: 'Matrix', colors: { primary: '#0A0A0A', background: '#fff', text: '#24292F', accent: '#00FF41', banner: '#0A0A0A', bannerText: '#00FF41' } },
        { name: 'Solarized', colors: { primary: '#002B36', background: '#fff', text: '#586E75', accent: '#268BD2', banner: '#002B36', bannerText: '#93A1A1' } },
      ],
    },
  },
  {
    name: 'Infographic',
    slug: 'infographic',
    templateJson: {
      fonts: { heading: 'Rubik', body: 'Inter' },
      colors: { primary: '#7C3AED', background: '#FFFFFF', text: '#1F2937', accent: '#F59E0B' },
      spacing: { sectionGap: 20, itemGap: 10, marginX: 40, marginY: 32 },
      layout: 'single-column', showPhoto: true, photoStyle: 'circle',
      sectionStyle: 'icon-headers', headerLayout: 'centered', skillStyle: 'bar', sectionDivider: 'dot',
      colorOptions: [
        { name: 'Vivid', colors: { primary: '#7C3AED', background: '#fff', text: '#1F2937', accent: '#F59E0B' } },
        { name: 'Ocean', colors: { primary: '#0891B2', background: '#fff', text: '#1F2937', accent: '#34D399' } },
        { name: 'Sunset', colors: { primary: '#E11D48', background: '#fff', text: '#1F2937', accent: '#F97316' } },
      ],
    },
  },
  {
    name: 'Modern Classic',
    slug: 'modern-classic',
    templateJson: {
      fonts: { heading: 'Inter', body: 'Inter' },
      colors: { primary: '#0F172A', background: '#FFFFFF', text: '#334155', accent: '#6366F1' },
      spacing: { sectionGap: 18, itemGap: 8, marginX: 48, marginY: 36 },
      layout: 'single-column', showPhoto: true, photoStyle: 'circle',
      sectionStyle: 'underline-headers', headerLayout: 'centered', skillStyle: 'pill', sectionDivider: 'line',
      colorOptions: [
        { name: 'Indigo', colors: { primary: '#0F172A', background: '#fff', text: '#334155', accent: '#6366F1' } },
        { name: 'Sky', colors: { primary: '#0F172A', background: '#fff', text: '#334155', accent: '#0EA5E9' } },
        { name: 'Amber', colors: { primary: '#0F172A', background: '#fff', text: '#334155', accent: '#D97706' } },
      ],
    },
  },
  {
    name: 'Academic',
    slug: 'academic',
    templateJson: {
      fonts: { heading: 'Lora', body: 'Inter' },
      colors: { primary: '#1A365D', background: '#FAFAF9', text: '#3F3F46', accent: '#78716C' },
      spacing: { sectionGap: 20, itemGap: 10, marginX: 52, marginY: 40 },
      layout: 'single-column', showPhoto: false, photoStyle: 'circle',
      sectionStyle: 'minimal-headers', headerLayout: 'left', skillStyle: 'list', sectionDivider: 'line',
      colorOptions: [
        { name: 'Classic', colors: { primary: '#1A365D', background: '#FAFAF9', text: '#3F3F46', accent: '#78716C' } },
        { name: 'Forest', colors: { primary: '#14532D', background: '#FAFAF9', text: '#3F3F46', accent: '#6B7280' } },
        { name: 'Brick', colors: { primary: '#7F1D1D', background: '#FAFAF9', text: '#3F3F46', accent: '#78716C' } },
      ],
    },
  },
  {
    name: 'Startup',
    slug: 'startup',
    templateJson: {
      fonts: { heading: 'DM Sans', body: 'Inter' },
      colors: { primary: '#0F172A', background: '#FFFFFF', text: '#1E293B', accent: '#06B6D4', banner: 'linear-gradient(135deg, #0F172A, #06B6D4)', bannerText: '#FFFFFF' },
      spacing: { sectionGap: 18, itemGap: 8, marginX: 44, marginY: 36 },
      layout: 'single-column', showPhoto: false, photoStyle: 'circle',
      sectionStyle: 'icon-headers', headerLayout: 'banner', skillStyle: 'bar', sectionDivider: 'space',
      colorOptions: [
        { name: 'Cyan', colors: { primary: '#0F172A', background: '#fff', text: '#1E293B', accent: '#06B6D4', banner: '#0F172A', bannerText: '#fff' } },
        { name: 'Pink', colors: { primary: '#0F172A', background: '#fff', text: '#1E293B', accent: '#EC4899', banner: '#0F172A', bannerText: '#fff' } },
        { name: 'Green', colors: { primary: '#0F172A', background: '#fff', text: '#1E293B', accent: '#10B981', banner: '#0F172A', bannerText: '#fff' } },
      ],
    },
  },
  {
    name: 'Hybrid',
    slug: 'hybrid',
    templateJson: {
      fonts: { heading: 'Inter', body: 'Merriweather' },
      colors: { primary: '#1E3A8A', background: '#FFFFFF', text: '#334155', accent: '#F59E0B', sidebar: '#FEFCE8', sidebarText: '#1E3A8A' },
      spacing: { sectionGap: 18, itemGap: 8, marginX: 40, marginY: 32 },
      layout: 'two-column', showPhoto: true, photoStyle: 'circle',
      sectionStyle: 'underline-headers', headerLayout: 'sidebar', photoPosition: 'right', skillStyle: 'pill', sectionDivider: 'space',
      colorOptions: [
        { name: 'Amber', colors: { primary: '#1E3A8A', background: '#fff', text: '#334155', accent: '#F59E0B', sidebar: '#FEFCE8', sidebarText: '#1E3A8A' } },
        { name: 'Emerald', colors: { primary: '#064E3B', background: '#fff', text: '#334155', accent: '#34D399', sidebar: '#ECFDF5', sidebarText: '#064E3B' } },
        { name: 'Fuchsia', colors: { primary: '#701A75', background: '#fff', text: '#334155', accent: '#D946EF', sidebar: '#FDF4FF', sidebarText: '#701A75' } },
      ],
    },
  },
];

async function main() {
  const adminEmail = 'anukul.patil.seo@gmail.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log(`Admin user already exists: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash('admin123', 12);
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: 'Anukul Patil',
        role: 'ADMIN',
        isVerified: true,
      },
    });
    console.log(`Created admin user: ${user.email} (ID: ${user.id})`);
  }

  for (const tpl of templates) {
    const existingTpl = await prisma.template.findUnique({ where: { slug: tpl.slug } });
    if (!existingTpl) {
      await prisma.template.create({ data: tpl as any });
      console.log(`Created template: ${tpl.name}`);
    } else {
      await prisma.template.update({
        where: { slug: tpl.slug },
        data: { templateJson: tpl.templateJson as any },
      });
      console.log(`Updated template: ${tpl.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
