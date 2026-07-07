import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { join } from 'path';
import { cwd } from 'process';

const font = (family: string, file: string, weight: number) => ({
  src: join(cwd(), 'src', 'pdf', 'fonts', file),
  fontWeight: weight as any,
});

Font.register({ family: 'Inter', fonts: [font('Inter', 'Inter-Regular.woff2', 400), font('Inter', 'Inter-SemiBold.woff2', 600), font('Inter', 'Inter-Bold.woff2', 700)] });
Font.register({ family: 'Poppins', fonts: [font('Poppins', 'Poppins-Regular.woff2', 400), font('Poppins', 'Poppins-SemiBold.woff2', 600), font('Poppins', 'Poppins-Bold.woff2', 700)] });
Font.register({ family: 'Playfair Display', fonts: [font('Playfair', 'PlayfairDisplay-Regular.woff2', 400), font('Playfair', 'PlayfairDisplay-Bold.woff2', 700)] });
Font.register({ family: 'Montserrat', fonts: [font('Montserrat', 'Montserrat-Regular.woff2', 400), font('Montserrat', 'Montserrat-Bold.woff2', 700)] });
Font.register({ family: 'Lato', fonts: [font('Lato', 'Lato-Regular.woff2', 400), font('Lato', 'Lato-Bold.woff2', 700)] });

const pageSizes = {
  A4: [595.28, 841.89] as [number, number],
  LETTER: [612, 792] as [number, number],
};

function getColors(tj: any, schemeName: string | null) {
  let colors = {
    primary: '#1a1a2e',
    background: '#ffffff',
    text: '#333333',
    accent: '#0f3460',
    ...(tj?.colors || {}),
  };
  if (schemeName && tj?.colorOptions) {
    const scheme = tj.colorOptions.find((o: any) => o.name === schemeName);
    if (scheme) colors = { ...colors, ...scheme.colors };
  }
  return colors;
}

const sectionLabels: Record<string, string> = {
  personal: 'Personal',
  summary: 'Professional Summary',
  education: 'Education',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
};

export function ResumePDF({ resumeJson, template }: any) {
  const tj = template?.templateJson || {};
  const schemeName = resumeJson?.metadata?.selectedColorScheme || null;
  const colors = getColors(tj, schemeName);
  const fonts = tj.fonts || { heading: 'Inter', body: 'Inter' };
  const registeredFonts = ['Inter', 'Poppins', 'Playfair Display', 'Montserrat', 'Lato'];
  const safeFont = (f: string) => registeredFonts.includes(f) ? f : 'Inter';
  const heading = safeFont(fonts.heading);
  const body = safeFont(fonts.body);
  const spacing = tj.spacing || { sectionGap: 16, itemGap: 8, marginX: 48, marginY: 36 };
  const layout = tj.layout || 'single-column';
  const sectionStyle = tj.sectionStyle || 'underline-headers';
  const showPhoto = tj.showPhoto !== false;
  const photoStyle = tj.photoStyle || 'circle';
  const headerLayout = tj.headerLayout || 'centered';
  const photoPosition = tj.photoPosition || 'left';
  const skillStyle = tj.skillStyle || 'pill';
  const sectionDivider = tj.sectionDivider || 'space';
  const isInSidebar = headerLayout === 'sidebar';

  const sections = resumeJson?.sections || {};
  const sectionOrder = resumeJson?.sectionOrder || [];

  const styles = StyleSheet.create({
    page: {
      padding: spacing.marginY,
      fontFamily: body,
      color: colors.text,
      backgroundColor: colors.background,
      flexDirection: layout === 'two-column' && isInSidebar ? 'row' : 'column',
    },
    sidebar: {
      width: '35%',
      backgroundColor: colors.sidebar || colors.primary,
      padding: spacing.marginY,
      color: colors.sidebarText || '#ffffff',
    },
    mainContent: {
      flex: 1,
      padding: spacing.marginY,
    },
    twoColBody: {
      flexDirection: 'row',
      gap: 24,
      marginTop: spacing.sectionGap,
    },
    twoColLeft: {
      width: '35%',
    },
    twoColRight: {
      flex: 1,
    },
    banner: {
      backgroundColor: colors.banner || colors.primary,
      padding: '20 ' + spacing.marginX,
      marginBottom: spacing.sectionGap,
      marginTop: -spacing.marginY,
      marginHorizontal: -spacing.marginX,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: 600 as any,
      color: colors.primary,
      fontFamily: heading,
      paddingBottom: 6,
      marginBottom: 10,
    },
    sectionHeaderMinimal: {
      fontSize: 13,
      fontWeight: 600 as any,
      color: colors.primary,
      fontFamily: heading,
      textTransform: 'uppercase' as any,
      letterSpacing: 1.5,
      paddingBottom: 6,
      marginBottom: 10,
      borderBottom: '1px solid ' + colors.primary + '44',
    },
    sectionHeaderIcon: {
      fontSize: 16,
      fontWeight: 600 as any,
      color: colors.primary,
      fontFamily: heading,
      borderLeft: '4px solid ' + colors.accent,
      paddingLeft: 10,
      marginBottom: 10,
    },
    sectionDividerLine: {
      borderBottom: '1px solid ' + colors.text + '22',
      marginBottom: spacing.sectionGap,
      paddingBottom: spacing.sectionGap,
    },
    sectionDividerSpace: {
      marginBottom: spacing.sectionGap,
    },
    personalCenter: {
      textAlign: 'center' as any,
      marginBottom: spacing.sectionGap,
    },
    name: {
      fontSize: 24,
      fontWeight: 700 as any,
      color: colors.primary,
      fontFamily: heading,
    },
    nameBanner: {
      fontSize: 22,
      fontWeight: 700 as any,
      color: colors.bannerText || '#ffffff',
      fontFamily: heading,
    },
    contactRow: {
      fontSize: 13,
      marginTop: 4,
      color: colors.text,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
    },
    contactBanner: {
      fontSize: 13,
      marginTop: 4,
      color: (colors.bannerText || '#ffffff') + 'dd',
    },
    linkRow: {
      fontSize: 11,
      marginTop: 2,
      color: colors.text + 'aa',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
    },
    summaryText: {
      fontSize: 13,
      lineHeight: 1.6,
      color: colors.text,
    },
    pill: {
      display: 'inline-block' as any,
      border: '1px solid ' + colors.primary + '33',
      padding: '3 10',
      fontSize: 12,
      borderRadius: 4,
      marginRight: 4,
      marginBottom: 4,
    },
    sectionItem: {
      fontSize: 13,
      color: colors.text,
      marginBottom: spacing.itemGap,
    },
    itemTitle: {
      fontWeight: 600 as any,
      color: colors.primary,
    },
    itemSubtitle: {
      color: colors.text,
    },
    itemMeta: {
      fontSize: 12,
      color: colors.text + 'aa',
      marginBottom: 2,
    },
    achievementList: {
      marginLeft: 16,
      fontSize: 12,
      lineHeight: 1.6,
    },
    skillBar: {
      height: 6,
      backgroundColor: colors.text + '22',
      borderRadius: 3,
      marginBottom: 8,
    },
    skillBarFill: {
      height: '100%',
      backgroundColor: colors.accent,
      borderRadius: 3,
    },
    skillGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap' as any,
      gap: 4,
    },
    skillGridItem: {
      fontSize: 12,
      padding: '2 0',
      color: colors.text,
    },
    listItem: {
      fontSize: 13,
      color: colors.text,
      marginBottom: 2,
    },
    sidebarText: {
      color: colors.sidebarText || '#ffffff',
      fontSize: 12,
    },
    sidebarSectionHeader: {
      fontSize: 13,
      fontWeight: 600 as any,
      color: colors.sidebarText || '#ffffff',
      textTransform: 'uppercase' as any,
      letterSpacing: 1,
      marginBottom: 6,
    },
    sidebarSeparator: {
      border: 'none',
      borderTop: '1px solid ' + (colors.sidebarText || '#ffffff') + '33',
      marginVertical: 16,
    },
    sidebarPill: {
      display: 'inline-block' as any,
      border: '1px solid ' + (colors.sidebarText || '#ffffff') + '44',
      padding: '2 8',
      fontSize: 11,
      borderRadius: 3,
      marginRight: 4,
      marginBottom: 4,
      color: colors.sidebarText || '#ffffff',
    },
    photoCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      objectFit: 'cover' as any,
    },
    photoSquare: {
      width: 72,
      height: 72,
      borderRadius: 4,
      objectFit: 'cover' as any,
    },
    photoPlaceholder: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoPlaceholderText: {
      color: '#ffffff',
      fontSize: 28,
      fontWeight: 700 as any,
    },
    photoSmall: {
      width: 48,
      height: 48,
      borderRadius: 24,
      objectFit: 'cover' as any,
    },
    techStack: {
      fontSize: 11,
      color: colors.text + 'aa',
      marginTop: 2,
    },
    compactHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      borderBottom: '1px solid ' + colors.text + '22',
      paddingBottom: 8,
      marginBottom: spacing.sectionGap,
    },
    leftHeader: {
      borderBottom: '1px solid ' + colors.text + '22',
      paddingBottom: 12,
      marginBottom: spacing.sectionGap,
    },
    splitHeader: {
      flexDirection: 'row',
      gap: 20,
      alignItems: 'center',
      marginBottom: spacing.sectionGap,
    },
    skillName: {
      fontSize: 12,
      marginBottom: 2,
      color: colors.text,
    },
    experienceRole: {
      fontWeight: 600 as any,
      color: colors.primary,
      fontSize: 14,
    },
    experienceCompany: {
      color: colors.text,
      fontSize: 13,
    },
  });

  const renderSectionHeader = (label: string) => {
    if (sectionStyle === 'icon-headers') {
      return <Text style={styles.sectionHeaderIcon}>{label}</Text>;
    }
    if (sectionStyle === 'minimal-headers') {
      return <Text style={styles.sectionHeaderMinimal}>{label}</Text>;
    }
    return <Text style={styles.sectionHeader}>{label}</Text>;
  };

  const getDividerStyle = () => {
    if (sectionDivider === 'line') return styles.sectionDividerLine;
    return styles.sectionDividerSpace;
  };

  const getPersonalData = () => {
    const sec = sections.personal;
    return sec?.data || {};
  };

  const getPhotoUrl = (data: any) => {
    const url = data?.photoUrl || '';
    if (!url) return null;
    return url.startsWith('http') ? url : `http://localhost:4000${url}`;
  };

  const renderPhotoPlaceholder = (initial: string, size: number) => (
    <View style={[styles.photoPlaceholder, { width: size, height: size, borderRadius: photoStyle === 'circle' ? size / 2 : 4 }]}>
      <Text style={[styles.photoPlaceholderText, { fontSize: size * 0.4 }]}>{initial.charAt(0)}</Text>
    </View>
  );

  const renderPhoto = (data: any, size: number) => {
    if (!showPhoto) return null;
    const photoUrl = getPhotoUrl(data);
    const borderRadius = photoStyle === 'circle' ? size / 2 : 4;
    if (photoUrl) {
      return <Image src={photoUrl} style={[styles.photoCircle, { width: size, height: size, borderRadius }]} />;
    }
    return renderPhotoPlaceholder(data?.fullName || 'A', size);
  };

  const renderPersonalCentered = (data: any) => (
    <View style={styles.personalCenter}>
      {showPhoto && <View style={{ alignItems: 'center', marginBottom: 8 }}>{renderPhoto(data, 72)}</View>}
      <Text style={styles.name}>{data?.fullName || 'Your Name'}</Text>
      <Text style={styles.contactRow}>{[data?.email, data?.phone].filter(Boolean).join(' | ')}</Text>
      {data?.location && <Text style={[styles.contactRow]}>{data.location}</Text>}
      <Text style={styles.linkRow}>{[data?.linkedin, data?.github?.replace('https://', ''), data?.portfolio].filter(Boolean).join(' | ')}</Text>
    </View>
  );

  const renderBannerHeader = (data: any) => (
    <View style={styles.banner}>
      {showPhoto && renderPhoto(data, 48)}
      <View style={{ flex: 1 }}>
        <Text style={styles.nameBanner}>{data?.fullName || 'Your Name'}</Text>
        <Text style={styles.contactBanner}>{[data?.email, data?.phone, data?.location].filter(Boolean).join(' | ')}</Text>
        <Text style={[styles.contactBanner, { fontSize: 11, color: (colors.bannerText || '#ffffff') + '88' }]}>
          {[data?.linkedin, data?.github?.replace('https://', ''), data?.portfolio].filter(Boolean).join(' | ')}
        </Text>
      </View>
    </View>
  );

  const renderSplitHeader = (data: any) => (
    <View style={styles.splitHeader}>
      {photoPosition !== 'right' && renderPhoto(data, 80)}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{data?.fullName || 'Your Name'}</Text>
        <Text style={styles.contactRow}>{[data?.email, data?.phone].filter(Boolean).join(' | ')}</Text>
        {data?.location && <Text style={styles.contactRow}>{data.location}</Text>}
        <Text style={styles.linkRow}>{[data?.linkedin, data?.github?.replace('https://', ''), data?.portfolio].filter(Boolean).join(' | ')}</Text>
      </View>
      {photoPosition === 'right' && renderPhoto(data, 80)}
    </View>
  );

  const renderCompactHeader = (data: any) => (
    <View style={styles.compactHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
        <Text style={[styles.name, { fontSize: 20 }]}>{data?.fullName || 'Your Name'}</Text>
        {data?.email && <Text style={{ fontSize: 12, color: colors.text }}>{data.email}</Text>}
      </View>
      <Text style={{ fontSize: 12, color: colors.text }}>{[data?.phone, data?.location].filter(Boolean).join(' | ')}</Text>
    </View>
  );

  const renderLeftHeader = (data: any) => (
    <View style={styles.leftHeader}>
      <Text style={[styles.name, { fontSize: 26 }]}>{data?.fullName || 'Your Name'}</Text>
      <Text style={styles.contactRow}>{[data?.email, data?.phone, data?.location].filter(Boolean).join(' | ')}</Text>
      <Text style={styles.linkRow}>{[data?.linkedin, data?.github, data?.portfolio].filter(Boolean).join(' | ')}</Text>
    </View>
  );

  const renderHeader = (data: any) => {
    if (!data) data = {};
    switch (headerLayout) {
      case 'banner': return renderBannerHeader(data);
      case 'split': return renderSplitHeader(data);
      case 'compact': return renderCompactHeader(data);
      case 'left': return renderLeftHeader(data);
      case 'centered':
      default: return renderPersonalCentered(data);
    }
  };

  const renderSummary = (text: string) => {
    if (!text) return null;
    return (
      <View style={getDividerStyle()} wrap={false}>
        {renderSectionHeader('Professional Summary')}
        <Text style={styles.summaryText}>{text}</Text>
      </View>
    );
  };

  const renderSkillsPill = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={getDividerStyle()} wrap={false}>
        {renderSectionHeader('Skills')}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {items.map((s: any, i: number) => (
            <Text key={i} style={styles.pill}>{s.name}</Text>
          ))}
        </View>
      </View>
    );
  };

  const renderSkillsBar = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={getDividerStyle()} wrap={false}>
        {renderSectionHeader('Skills')}
        {items.map((s: any, i: number) => {
          const pct = s.level === 'expert' ? 95 : s.level === 'advanced' ? 80 : s.level === 'intermediate' ? 60 : 40;
          return (
            <View key={i}>
              <Text style={styles.skillName}>{s.name}</Text>
              <View style={styles.skillBar}>
                <View style={[styles.skillBarFill, { width: pct + '%' }]} />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSkillsList = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={getDividerStyle()} wrap={false}>
        {renderSectionHeader('Skills')}
        {items.map((s: any, i: number) => (
          <Text key={i} style={styles.listItem}>- {s.name}</Text>
        ))}
      </View>
    );
  };

  const renderSkillsGrid = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={getDividerStyle()} wrap={false}>
        {renderSectionHeader('Skills')}
        <View style={styles.skillGrid}>
          {items.map((s: any, i: number) => (
            <Text key={i} style={styles.skillGridItem}>{s.name}</Text>
          ))}
        </View>
      </View>
    );
  };

  const renderSkills = (items: any[]) => {
    if (skillStyle === 'bar') return renderSkillsBar(items);
    if (skillStyle === 'list') return renderSkillsList(items);
    if (skillStyle === 'grid') return renderSkillsGrid(items);
    return renderSkillsPill(items);
  };

  const renderEducation = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={getDividerStyle()} wrap={false}>
        {renderSectionHeader('Education')}
        {items.map((item: any, i: number) => (
          <View key={i} style={styles.sectionItem}>
            <Text style={styles.itemTitle}>{item.degree}</Text>
            {item.institution && <Text style={styles.itemSubtitle}> — {item.institution}</Text>}
            <Text style={styles.itemMeta}>
              {[item.location, item.startYear && item.endYear ? item.startYear + ' – ' + item.endYear : '', item.cgpa ? 'GPA: ' + item.cgpa : ''].filter(Boolean).join(' | ')}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderExperience = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={getDividerStyle()} wrap={false}>
        {renderSectionHeader('Experience')}
        {items.map((item: any, i: number) => (
          <View key={i} style={styles.sectionItem}>
            <Text style={styles.experienceRole}>{item.role}</Text>
            <Text style={styles.experienceCompany}>{item.company}</Text>
            <Text style={styles.itemMeta}>
              {[item.location, item.startDate + ' – ' + (item.isCurrent ? 'Present' : item.endDate)].filter(Boolean).join(' | ')}
            </Text>
            {item.achievements?.length > 0 && (
              <View style={styles.achievementList}>
                {item.achievements.map((a: string, j: number) => (
                  <Text key={j} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 1 }}>- {a}</Text>
                ))}
              </View>
            )}
            {item.techStack?.length > 0 && (
              <Text style={styles.techStack}>Tech: {item.techStack.join(', ')}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderProjects = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={getDividerStyle()} wrap={false}>
        {renderSectionHeader('Projects')}
        {items.map((item: any, i: number) => (
          <View key={i} style={styles.sectionItem}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            {item.domain && <Text style={{ fontSize: 12, color: colors.text + 'aa' }}> ({item.domain})</Text>}
            {item.description && <Text style={{ fontSize: 12, lineHeight: 1.5 }}>{item.description}</Text>}
            {item.techStack?.length > 0 && <Text style={styles.techStack}>{item.techStack.join(', ')}</Text>}
          </View>
        ))}
      </View>
    );
  };

  const renderCertifications = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={getDividerStyle()} wrap={false}>
        {renderSectionHeader('Certifications')}
        {items.map((item: any, i: number) => (
          <View key={i} style={styles.sectionItem}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemMeta}>{[item.issuer, item.date].filter(Boolean).join(' | ')}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderLanguages = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={getDividerStyle()} wrap={false}>
        {renderSectionHeader('Languages')}
        {items.map((item: any, i: number) => (
          <View key={i} style={[styles.sectionItem, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <Text>{item.name}</Text>
            <Text style={{ fontSize: 12, color: colors.text + 'aa', textTransform: 'capitalize' }}>{item.proficiency}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSectionByKey = (key: string) => {
    const section = sections[key];
    if (!section || section.visible === false) return null;
    if (key === 'personal') return null;
    if (key === 'summary') return renderSummary(section.text);
    const items = section.items || [];
    if (items.length === 0) return null;
    switch (key) {
      case 'skills': return renderSkills(items);
      case 'education': return renderEducation(items);
      case 'experience': return renderExperience(items);
      case 'projects': return renderProjects(items);
      case 'certifications': return renderCertifications(items);
      case 'languages': return renderLanguages(items);
      default: return null;
    }
  };

  const renderSidebarContent = () => {
    const data = sections.personal?.data || {};
    const summary = sections.summary?.text || '';
    const skills = sections.skills?.items || [];
    return (
      <View style={styles.sidebar}>
        {showPhoto ? <View style={{ alignItems: 'center', marginBottom: 12 }}>{renderPhoto(data, 80)}</View> : null}
        <Text style={[styles.sidebarText, { fontSize: 22, fontWeight: 700, fontFamily: heading, textAlign: 'center', marginBottom: 4 }]}>
          {data?.fullName || 'Your Name'}
        </Text>
        <Text style={[styles.sidebarText, { fontSize: 12, textAlign: 'center' }]}>
          {[data?.email, data?.phone].filter(Boolean).join(' | ')}
        </Text>
        {data?.location && <Text style={[styles.sidebarText, { fontSize: 12, textAlign: 'center' }]}>{data.location}</Text>}
        <Text style={[styles.sidebarText, { fontSize: 11, textAlign: 'center', marginTop: 4 }]}>
          {[data?.linkedin, data?.github, data?.portfolio].filter(Boolean).join(' | ')}
        </Text>
        <View style={styles.sidebarSeparator} />
        <Text style={styles.sidebarSectionHeader}>About</Text>
        <Text style={[styles.sidebarText, { lineHeight: 1.6, fontSize: 12 }]}>{summary}</Text>
        <View style={styles.sidebarSeparator} />
        <Text style={styles.sidebarSectionHeader}>Skills</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {skills.map((s: any, i: number) => (
            <Text key={i} style={styles.sidebarPill}>{s.name}</Text>
          ))}
        </View>
      </View>
    );
  };

  const renderMainSections = () => {
    return sectionOrder
      .map((key: string) => {
        const el = renderSectionByKey(key);
        return el ? <View key={key}>{el}</View> : null;
      })
      .filter(Boolean);
  };

  const renderSidebarRightKeys = () => {
    const rightKeys = sectionOrder.filter((k: string) => !['personal', 'summary', 'skills'].includes(k));
    return rightKeys
      .map((key: string) => {
        const section = sections[key];
        if (!section || section.visible === false) return null;
        const items = section.items || [];
        if (items.length === 0) return null;
        switch (key) {
          case 'education': return <View key={key}>{renderEducation(items)}</View>;
          case 'experience': return <View key={key}>{renderExperience(items)}</View>;
          case 'projects': return <View key={key}>{renderProjects(items)}</View>;
          case 'certifications': return <View key={key}>{renderCertifications(items)}</View>;
          case 'languages': return <View key={key}>{renderLanguages(items)}</View>;
          default: return null;
        }
      })
      .filter(Boolean);
  };

  const renderTwoColumnRightKeys = () => {
    return sectionOrder
      .filter((k: string) => !['personal', 'summary', 'skills'].includes(k))
      .map((key: string) => {
        const el = renderSectionByKey(key);
        return el ? <View key={key}>{el}</View> : null;
      })
      .filter(Boolean);
  };

  const pd = sections.personal?.data || {};

  if (layout === 'two-column' && isInSidebar) {
    return (
      <Document>
        <Page size={pageSizes.A4} style={styles.page}>
          {renderSidebarContent()}
          <View style={styles.mainContent}>
            {renderSidebarRightKeys()}
          </View>
        </Page>
      </Document>
    );
  }

  if (layout === 'two-column') {
    const summaryEl = sections.summary?.visible !== false && sections.summary?.text ? (
      <View key="summary">{renderSummary(sections.summary.text)}</View>
    ) : null;
    const skillsEl = sections.skills?.visible !== false && sections.skills?.items?.length ? (
      <View key="skills">{renderSkills(sections.skills.items)}</View>
    ) : null;
    return (
      <Document>
        <Page size={pageSizes.A4} style={styles.page}>
          {renderHeader(pd)}
          <View style={styles.twoColBody}>
            <View style={styles.twoColLeft}>
              {summaryEl}
              {skillsEl}
            </View>
            <View style={styles.twoColRight}>
              {renderTwoColumnRightKeys()}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size={pageSizes.A4} style={styles.page}>
        {renderHeader(pd)}
        {renderMainSections()}
      </Page>
    </Document>
  );
}
