// ─────────────────────────────────────────────────────────
//  Code Quality Validator — Client-Side Analysis Engine
// ─────────────────────────────────────────────────────────

export interface VFSFile {
  name: string;
  content: string;
  language?: string;
}

export interface FileQualityReport {
  name: string;
  lines: number;
  tailwindClasses: number;
  arabicRatio: number;
  grade: "A" | "B" | "C" | "D" | "F";
  issues: string[];
}

export interface QualityBreakdown {
  codeSize: number;       // 0-20
  tailwindRichness: number; // 0-20
  arabicContent: number;  // 0-20
  interactivity: number;  // 0-20
  completeness: number;   // 0-20
}

export interface CodeQualityReport {
  score: number;          // 0-100
  passed: boolean;        // true if >= 80
  breakdown: QualityBreakdown;
  files: FileQualityReport[];
  issues: string[];
  suggestions: string[];
}

const ARABIC_REGEX = /[\u0600-\u06FF]/g;

function countTailwindClasses(content: string): number {
  const matches = content.match(/className="[^"]+"/g) || [];
  let count = 0;
  for (const m of matches) {
    const inner = m.slice(11, -1); // remove className=" and trailing "
    count += inner.split(/\s+/).length;
  }
  return count;
}

function getFileGrade(lines: number, arabicRatio: number, tailwindCount: number): "A" | "B" | "C" | "D" | "F" {
  const lineScore = lines >= 300 ? 4 : lines >= 200 ? 3 : lines >= 150 ? 2 : lines >= 100 ? 1 : 0;
  const arabicScore = arabicRatio >= 0.3 ? 4 : arabicRatio >= 0.2 ? 3 : arabicRatio >= 0.1 ? 2 : 1;
  const tailwindScore = tailwindCount >= 40 ? 4 : tailwindCount >= 20 ? 3 : tailwindCount >= 10 ? 2 : 1;
  const total = lineScore + arabicScore + tailwindScore;
  if (total >= 10) return "A";
  if (total >= 8) return "B";
  if (total >= 6) return "C";
  if (total >= 4) return "D";
  return "F";
}

export function validateCodeQuality(files: VFSFile[]): CodeQualityReport {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const fileReports: FileQualityReport[] = [];

  // Filter code files (tsx only, excluding App.tsx for avg calc)
  const codeFiles = files.filter(f => f.name.endsWith(".tsx") && f.name !== "App.tsx");
  const allFiles = files;

  // ─── 1. Code Size (0-20) ───
  const fileLengths = codeFiles.map(f => f.content.split("\n").length);
  const avgLines = fileLengths.length > 0 ? fileLengths.reduce((a, b) => a + b, 0) / fileLengths.length : 0;
  let codeSizeScore = 0;
  if (avgLines >= 300) codeSizeScore = 20;
  else if (avgLines >= 250) codeSizeScore = 17;
  else if (avgLines >= 200) codeSizeScore = 15;
  else if (avgLines >= 150) codeSizeScore = 10;
  else if (avgLines >= 100) codeSizeScore = 7;
  else codeSizeScore = 3;

  if (avgLines < 200) {
    issues.push("متوسط حجم المكونات " + Math.round(avgLines) + " سطر — المطلوب 200+");
    suggestions.push("اجعل كل مكون أغنى بإضافة عناصر زخرفية وتفاعلات hover/focus");
  }

  // ─── 2. Tailwind Richness (0-20) ───
  const allContent = allFiles.map(f => f.content).join(" ");
  const hasGradients = /bg-gradient-to|from-.*to-/.test(allContent);
  const hasComplexGradients = /via-/.test(allContent);
  const hasShadows = /shadow-(xl|2xl|lg)/.test(allContent);
  const hasMultipleShadows = /shadow-.*shadow-/.test(allContent);
  const hasHovers = /hover:/.test(allContent);
  const hasAnimations = /animate-|@keyframes/.test(allContent);
  const hasTransitions = /transition-all|transition-colors|transition-transform/.test(allContent);
  const hasTransforms = /scale-\[|rotate-|translate-y|hover:scale|hover:-translate/.test(allContent);
  const hasGlassEffect = /backdrop-blur|glass-effect/.test(allContent);
  const hasFocusStates = /focus:ring|focus:border/.test(allContent);

  let tailwindScore = 0;
  if (hasGradients) tailwindScore += 2;
  if (hasComplexGradients) tailwindScore += 3;
  if (hasShadows) tailwindScore += 2;
  if (hasMultipleShadows) tailwindScore += 1;
  if (hasHovers) tailwindScore += 3;
  if (hasAnimations) tailwindScore += 2;
  if (hasTransitions) tailwindScore += 2;
  if (hasTransforms) tailwindScore += 2;
  if (hasGlassEffect) tailwindScore += 2;
  if (hasFocusStates) tailwindScore += 1;
  tailwindScore = Math.min(20, tailwindScore);

  if (tailwindScore < 14) {
    const missing: string[] = [];
    if (!hasGradients) missing.push("gradients");
    if (!hasComplexGradients) missing.push("complex gradients (via-)");
    if (!hasShadows) missing.push("shadows");
    if (!hasHovers) missing.push("hover states");
    if (!hasGlassEffect) missing.push("glass effects");
    if (!hasFocusStates) missing.push("focus states");
    issues.push("ينقص Tailwind features: " + missing.join("، "));
    suggestions.push("أضف تدرجات معقدة (via-)، ظلال متعددة، وتأثيرات glass");
  }

  // ─── 3. Arabic Content (0-20) ───
  const textOnly = allContent.replace(/className="[^"]*"/g, "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ");
  const arabicChars = (textOnly.match(ARABIC_REGEX) || []).length;
  const latinChars = (textOnly.match(/[a-zA-Z]/g) || []).length;
  const totalTextChars = arabicChars + latinChars;
  const arabicRatio = totalTextChars > 0 ? arabicChars / totalTextChars : 0;

  let arabicScore = 0;
  if (arabicRatio >= 0.85) arabicScore = 20;
  else if (arabicRatio >= 0.7) arabicScore = 16;
  else if (arabicRatio >= 0.5) arabicScore = 12;
  else if (arabicRatio >= 0.3) arabicScore = 8;
  else arabicScore = 4;

  if (arabicRatio < 0.7) {
    issues.push("نسبة المحتوى العربي " + Math.round(arabicRatio * 100) + "% — المطلوب 70%+");
    suggestions.push("تأكد من كتابة كل النصوص بالعربي مع بيانات سعودية");
  }

  // ─── 4. Interactivity (0-20) ───
  const hasButtons = /button|btn|CTA/i.test(allContent);
  const hasForms = /form|input|textarea/i.test(allContent);
  const hasLinks = /href=|<a /.test(allContent);
  const hasHoverEffects = /hover:-translate|hover:scale|hover:shadow|hover:rotate/.test(allContent);
  const hasActiveStates = /active:scale|active:bg/.test(allContent);
  const hasBackgroundDecorations = /(blur-(2xl|3xl).*absolute|absolute.*blur-(2xl|3xl))/.test(allContent);

  let interactivityScore = 0;
  if (hasButtons) interactivityScore += 3;
  if (hasForms) interactivityScore += 3;
  if (hasLinks) interactivityScore += 3;
  if (hasHoverEffects) interactivityScore += 4;
  if (hasActiveStates) interactivityScore += 3;
  if (hasBackgroundDecorations) interactivityScore += 4;
  interactivityScore = Math.min(20, interactivityScore);

  if (interactivityScore < 14) {
    issues.push("التفاعلية ضعيفة — المطلوب hover effects، أزرار، نماذج، خلفيات زخرفية");
    suggestions.push("أضف micro-interactions على كل عنصر: hover:-translate-y-1، hover:shadow-xl، active:scale-[0.98]");
  }

  // ─── 5. Completeness (0-20) ───
  const hasApp = allFiles.some(f => f.name === "App.tsx");
  const hasStyles = allFiles.some(f => f.name === "styles.css" || f.name.endsWith(".css"));
  const hasHeader = allFiles.some(f => /header/i.test(f.name));
  const hasHero = allFiles.some(f => /hero/i.test(f.name));
  const hasFooter = allFiles.some(f => /footer/i.test(f.name));
  const hasContact = allFiles.some(f => /contact/i.test(f.name));
  const componentCount = codeFiles.length;

  let completenessScore = 0;
  if (hasApp) completenessScore += 3;
  if (hasStyles) completenessScore += 2;
  if (hasHeader) completenessScore += 2;
  if (hasHero) completenessScore += 2;
  if (hasFooter) completenessScore += 2;
  if (hasContact) completenessScore += 2;
  if (componentCount >= 10) completenessScore += 7;
  else if (componentCount >= 7) completenessScore += 5;
  else if (componentCount >= 5) completenessScore += 3;
  else completenessScore += 1;
  completenessScore = Math.min(20, completenessScore);

  if (componentCount < 8) {
    issues.push("عدد المكونات " + componentCount + " — المطلوب 8+");
    suggestions.push("أضف مكونات: Stats, Testimonials, CTA, FAQ, Gallery");
  }

  // ─── Per-file analysis ───
  allFiles.forEach(file => {
    const lines = file.content.split("\n").length;
    const twClasses = countTailwindClasses(file.content);
    const fileArabic = (file.content.match(ARABIC_REGEX) || []).length;
    const fileTotal = file.content.replace(/\s/g, "").length;
    const fileArabicRatio = fileTotal > 0 ? fileArabic / fileTotal : 0;
    const grade = getFileGrade(lines, fileArabicRatio, twClasses);

    const fileIssues: string[] = [];
    if (lines < 100 && file.name.endsWith(".tsx") && file.name !== "App.tsx") {
      fileIssues.push("الملف قصير جداً (" + lines + " سطر)");
    }
    if (twClasses < 5 && file.name.endsWith(".tsx")) {
      fileIssues.push("استخدام Tailwind ضعيف");
    }

    fileReports.push({
      name: file.name,
      lines,
      tailwindClasses: twClasses,
      arabicRatio: fileArabicRatio,
      grade,
      issues: fileIssues,
    });
  });

  const totalScore = codeSizeScore + tailwindScore + arabicScore + interactivityScore + completenessScore;

  if (totalScore >= 90) {
    suggestions.push("🏆 جودة ممتازة! الموقع جاهز للنشر");
  } else if (totalScore >= 80) {
    suggestions.push("✅ جودة جيدة — يمكن تحسينها بإضافة تفاصيل أكثر");
  } else {
    suggestions.push("❌ الجودة دون المعيار — يُنصح بإعادة التوليد مع وصف أكثر تفصيلاً");
  }

  return {
    score: totalScore,
    passed: totalScore >= 80,
    breakdown: {
      codeSize: codeSizeScore,
      tailwindRichness: tailwindScore,
      arabicContent: arabicScore,
      interactivity: interactivityScore,
      completeness: completenessScore,
    },
    files: fileReports,
    issues,
    suggestions,
  };
}
