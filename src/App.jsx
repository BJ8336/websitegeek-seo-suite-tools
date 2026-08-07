import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ToolPlaceholder from './components/ToolPlaceholder'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Account from './pages/Account'
import NotFound from './pages/NotFound'
import { tools } from './data/toolsConfig'
import CharacterCounter from './tools/character-counter/CharacterCounter'
import WordCounter from './tools/word-counter/WordCounter'
import LineCounter from './tools/line-counter/LineCounter'
import CaseConverter from './tools/case-converter/CaseConverter'
import KeywordDensityChecker from './tools/keyword-density-checker/KeywordDensityChecker'
import MetaSnippetOptimizer from './tools/meta-snippet-optimizer/MetaSnippetOptimizer'
import HeadingStructureAuditor from './tools/heading-structure-auditor/HeadingStructureAuditor'
import SchemaMarkupGenerator from './tools/schema-markup-generator/SchemaMarkupGenerator'
import OpenGraphPreviewer from './tools/open-graph-previewer/OpenGraphPreviewer'
import InternalLinkAnalyzer from './tools/internal-link-analyzer/InternalLinkAnalyzer'
import RobotsTxtGenerator from './tools/robots-txt-generator/RobotsTxtGenerator'
import XmlSitemapGenerator from './tools/xml-sitemap-generator/XmlSitemapGenerator'
import RedirectHtaccessBuilder from './tools/redirect-htaccess-builder/RedirectHtaccessBuilder'
import BrokenLinkChecker from './tools/broken-link-checker/BrokenLinkChecker'
import CoreWebVitalsEstimator from './tools/core-web-vitals-estimator/CoreWebVitalsEstimator'
import LsiTermExtractor from './tools/lsi-term-extractor/LsiTermExtractor'
import AiContentDetector from './tools/ai-content-detector/AiContentDetector'
import SeoContentScore from './tools/seo-content-score/SeoContentScore'
import OrganicRankingChecker from './tools/organic-ranking-checker/OrganicRankingChecker'
import CompetitorPageAuditor from './tools/competitor-page-auditor/CompetitorPageAuditor'
import { guides } from './data/guidesConfig'
import GuidesHub from './pages/guides/GuidesHub'
import KeywordDensityGuide from './pages/guides/KeywordDensityGuide'
import MetaDescriptionGuide from './pages/guides/MetaDescriptionGuide'
import SchemaMarkupGuide from './pages/guides/SchemaMarkupGuide'
import RobotsTxtGuide from './pages/guides/RobotsTxtGuide'
import XmlSitemapGuide from './pages/guides/XmlSitemapGuide'
import InternalLinkingGuide from './pages/guides/InternalLinkingGuide'
import CoreWebVitalsGuide from './pages/guides/CoreWebVitalsGuide'
import OpenGraphGuide from './pages/guides/OpenGraphGuide'
import SiteAuditChecklistGuide from './pages/guides/SiteAuditChecklistGuide'

const GUIDE_COMPONENTS = {
  'keyword-density-checker': KeywordDensityGuide,
  'meta-description-guide': MetaDescriptionGuide,
  'schema-markup-guide': SchemaMarkupGuide,
  'robots-txt-guide': RobotsTxtGuide,
  'xml-sitemap-guide': XmlSitemapGuide,
  'internal-linking-best-practices': InternalLinkingGuide,
  'core-web-vitals-explained': CoreWebVitalsGuide,
  'open-graph-tags-guide': OpenGraphGuide,
  'complete-site-audit-checklist': SiteAuditChecklistGuide,
}

// Tools with a real implementation. Everything else in toolsConfig still
// falls back to ToolPlaceholder until its phase is built.
const TOOL_COMPONENTS = {
  'character-counter': CharacterCounter,
  'word-counter': WordCounter,
  'line-counter': LineCounter,
  'case-converter': CaseConverter,
  'keyword-density-checker': KeywordDensityChecker,
  'meta-snippet-optimizer': MetaSnippetOptimizer,
  'heading-structure-auditor': HeadingStructureAuditor,
  'schema-markup-generator': SchemaMarkupGenerator,
  'open-graph-previewer': OpenGraphPreviewer,
  'internal-link-analyzer': InternalLinkAnalyzer,
  'robots-txt-generator': RobotsTxtGenerator,
  'xml-sitemap-generator': XmlSitemapGenerator,
  'redirect-htaccess-builder': RedirectHtaccessBuilder,
  'broken-link-checker': BrokenLinkChecker,
  'core-web-vitals-estimator': CoreWebVitalsEstimator,
  'lsi-term-extractor': LsiTermExtractor,
  'ai-content-detector': AiContentDetector,
  'seo-content-score': SeoContentScore,
  'organic-ranking-checker': OrganicRankingChecker,
  'competitor-page-auditor': CompetitorPageAuditor,
}

function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/account" element={<Account />} />
          <Route path="/guides" element={<GuidesHub />} />
          {guides.map((guide) => {
            const GuideComponent = GUIDE_COMPONENTS[guide.slug]
            if (!GuideComponent) return null
            return <Route key={guide.slug} path={`/guides/${guide.slug}`} element={<GuideComponent />} />
          })}
          {tools.map((tool) => {
            const ToolComponent = TOOL_COMPONENTS[tool.slug]
            return (
              <Route
                key={tool.slug}
                path={`/tools/${tool.slug}`}
                element={ToolComponent ? <ToolComponent /> : <ToolPlaceholder tool={tool} />}
              />
            )
          })}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
