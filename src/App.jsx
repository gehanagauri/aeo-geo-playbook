// Page composition: progress bar, hero, sticky nav, callout, TOC, the five
// modules, footer — plus the Tweaks panel when the URL has ?tweaks.
import React from 'react';
import { ScrollProgress, StickyNav } from './components/StickyNav.jsx';
import Hero from './components/Hero.jsx';
import WhyCallout from './components/WhyCallout.jsx';
import TableOfContents from './components/TableOfContents.jsx';
import Module01 from './components/Module01.jsx';
import Module02 from './components/Module02.jsx';
import Module03 from './components/Module03.jsx';
import ShareOfModelTool from './components/ShareOfModelTool.jsx';
import Module05 from './components/Module05.jsx';
import Footer from './components/Footer.jsx';
import PlaybookTweaks from './components/PlaybookTweaks.jsx';

const App = () =>
<div id="top">
    <ScrollProgress />
    <Hero />
    <StickyNav />
    <WhyCallout />
    <TableOfContents />
    <Module01 />
    <Module02 />
    <Module03 />
    <ShareOfModelTool />
    <Module05 />
    <Footer />
    {typeof window !== 'undefined' && window.location.search.includes('tweaks') && <PlaybookTweaks />}
  </div>;


export default App;
