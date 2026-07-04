  Console Error

Each child in a list should have a unique "key" prop.

Check the render method of `ResumePreview`. See https://react.dev/link/warning-keys for more information.

src\app\dashboard\resumes\[id]\page.tsx (455:7) @ renderCompactHeader


  453 |   const renderCompactHeader = (data: any) => (
  454 |     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.sectionGap, borderBottom: `1px solid ${colors.text}22`, paddingBottom: 8 }}>
> 455 |       <div>
      |       ^
  456 |         <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.primary, fontFamily: fonts.heading, margin: 0, display: 'inline' }}>{data?.fullName || 'Your Name'}</h1>
  457 |         {data?.email && <span style={{ fontSize: 12, marginLeft: 12, color: colors.text }}>{data.email}</span>}
  458 |       </div>
Call Stack
27

Show 22 ignore-listed frame(s)
div
<anonymous>
renderCompactHeader
src\app\dashboard\resumes\[id]\page.tsx (455:7)
renderHeader
src\app\dashboard\resumes\[id]\page.tsx (478:30)
ResumePreview
src\app\dashboard\resumes\[id]\page.tsx (553:8)
ResumeBuilderPage
src\app\dashboard\resumes\[id]\page.tsx (128:9)

and one more error
Console Error

Each child in a list should have a unique "key" prop.

Check the render method of `div`. It was passed a child from ResumePreview. See https://react.dev/link/warning-keys for more information.

src\app\dashboard\resumes\[id]\page.tsx (354:5) @ renderSummary


  352 |
  353 |   const renderSummary = (text: string, textColor?: string) => (
> 354 |     <div style={sectionDividerStyle}>
      |     ^
  355 |       {renderSectionHeader('Professional Summary', textColor)}
  356 |       <p style={{ fontSize: 13, lineHeight: 1.6, color: textColor || colors.text, fontFamily: fonts.body }}>{text || '—'}</p>
  357 |     </div>
Call Stack
28

Show 22 ignore-listed frame(s)
div
<anonymous>
renderSummary
src\app\dashboard\resumes\[id]\page.tsx (354:5)
eval
src\app\dashboard\resumes\[id]\page.tsx (558:39)
Array.map
<anonymous>
ResumePreview
src\app\dashboard\resumes\[id]\page.tsx (554:21)
ResumeBuilderPage
src\app\dashboard\resumes\[id]\page.tsx (128:9)