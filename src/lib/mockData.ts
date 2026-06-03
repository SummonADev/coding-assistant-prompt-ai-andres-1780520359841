import type { AnalysisResult } from '@/types';

export const MOCK_RESULTS: Record<string, AnalysisResult> = {
  AAPL: {
    metadata: {
      companyName: 'Apple Inc.',
      ticker: 'AAPL',
      cik: '0000320193',
      filingDate: '2024-11-01',
      fiscalYearEnd: 'September 28, 2024',
      filingType: '10-K',
      secUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=10-K',
    },
    memo: {
      dealSignal: 'Favorable',
      executiveSummary:
        'Apple Inc. is the world's largest technology company by market capitalization, operating a vertically integrated hardware-software-services ecosystem anchored by the iPhone, Mac, iPad, and a rapidly growing Services segment. Financial health is exceptional: FY2024 revenue of $391.0B reflects modest growth with gross margins expanding to 46.2%, supported by $118.3B in operating cash flow and a net cash position of approximately $58B after debt. The most critical risk is continued iPhone concentration (~52% of revenue) combined with escalating U.S.–China trade tensions that threaten supply chain integrity and market access in Apple's second-largest geography. Overall deal attractiveness is Favorable given unparalleled brand equity, ecosystem lock-in, and a structurally improving margin profile driven by Services mix shift.',
      financialHealth:
        '## Revenue Trend\n- FY2024 total net sales: $391.0B (+2.0% YoY from $383.3B)\n- iPhone revenue: $201.2B (–0.3% YoY); Services: $96.2B (+12.8% YoY)\n- Mac: $29.9B (+2.5%); iPad: $26.7B (+–1.2%); Wearables: $37.0B (–7.1%)\n\n## Profitability\n- Gross margin: 46.2% (vs. 44.1% prior year) — driven by Services mix\n- Operating margin: 31.5%\n- Net margin: 26.4% ($103.3B net income)\n\n## Cash Flow Quality\n- Operating cash flow: $118.3B\n- Free cash flow: ~$111.4B (capex ~$6.9B)\n- High conversion rate confirms earnings quality\n\n## Debt & Liquidity\n- Cash and marketable securities: ~$153B\n- Total debt: ~$95B\n- Net cash: ~$58B\n- Current ratio: 0.87x (managed deliberately low via share buybacks)\n\n**Verdict:** Financially elite — high-margin, cash-generative, and capital-light with a shareholder return program exceeding $110B annually.',
      riskFactors: [
        {
          name: 'iPhone Concentration Risk',
          description:
            'iPhone accounts for ~52% of total revenue; any demand deceleration, product cycle miss, or competitive displacement directly impairs top-line results.',
          impact: 'High',
        },
        {
          name: 'China Geopolitical & Regulatory Risk',
          description:
            'Greater China represents ~17% of revenue and is the primary manufacturing hub; U.S.–China trade restrictions, tariffs, or retaliatory measures could disrupt both supply and demand simultaneously.',
          impact: 'High',
        },
        {
          name: 'Regulatory & Antitrust Exposure',
          description:
            'The App Store business model faces active DOJ antitrust litigation and EU Digital Markets Act enforcement, which could structurally reduce Services segment economics.',
          impact: 'High',
        },
        {
          name: 'AI Competitive Displacement',
          description:
            'Rapid advancement of generative AI by Google, Microsoft, and OpenAI could erode the perceived intelligence advantage of Apple devices and Siri, reducing ecosystem stickiness.',
          impact: 'Medium',
        },
        {
          name: 'Supply Chain Concentration',
          description:
            'TSMC manufactures the majority of Apple silicon; any disruption in Taiwan — natural disaster, geopolitical event, or capacity constraint — would halt production.',
          impact: 'Medium',
        },
      ],
      redFlags:
        '## Red Flag Assessment\n\n**No material red flags identified.** Key observations:\n\n- No going concern language or auditor qualification\n- Internal controls assessed as effective; no material weaknesses disclosed\n- No active restatements\n- Litigation: Active DOJ antitrust case re: App Store; EU DMA enforcement ongoing. Exposure material but within company's capacity to manage\n- Share repurchase program well-disclosed; no unusual related-party transactions\n- Revenue recognition policy consistent with prior years\n\n**Monitoring items (not disqualifying):**\n- App Store take-rate litigation could structurally impair Services margins over 3–5 year horizon\n- China Huawei recovery in domestic market bears watching in context of iPhone market share',
      competitivePosition:
        '## Primary Markets & Segments\n- Consumer electronics (iPhone, Mac, iPad, Wearables) + digital services (App Store, iCloud, Apple Music, Apple TV+, Apple Pay)\n- Operates in 175+ countries\n\n## Competitive Advantages\n1. Ecosystem lock-in: iMessage, AirDrop, Continuity features create high switching costs\n2. Vertical integration: Apple Silicon (M-series, A-series) delivers best-in-class performance/watt\n3. Brand premium: Commands 15–30% ASP premium vs. Android OEMs in every category\n4. Developer platform: 36M+ registered developers; App Store generates >$1.1T in ecosystem billings\n\n## Key Competitors\n- Samsung (devices), Google (Android ecosystem, Pixel), Microsoft (enterprise), Spotify/Netflix (services)\n\n## Market Position\n**Leader** — #1 smartphone by revenue share globally; #1 tablet; #1 smartwatch; #2 PC by revenue\n\n## Strategic Initiatives\n- Apple Intelligence (generative AI integration into iOS/macOS) — critical to defend ecosystem relevance\n- Expansion of financial services (Apple Card, Apple Pay Later wind-down noted)\n- India as manufacturing and demand diversification hedge against China risk',
    },
  },
  JPM: {
    metadata: {
      companyName: 'JPMorgan Chase & Co.',
      ticker: 'JPM',
      cik: '0000019617',
      filingDate: '2025-02-18',
      fiscalYearEnd: 'December 31, 2024',
      filingType: '10-K',
      secUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000019617&type=10-K',
    },
    memo: {
      dealSignal: 'Neutral',
      executiveSummary:
        'JPMorgan Chase is the largest U.S. bank by assets ($3.9T) and a global leader across consumer banking, investment banking, commercial banking, and asset/wealth management. FY2024 net revenue reached $177.6B with net income of $58.5B and ROTCE of 21%—metrics that rank best-in-class among global systemically important banks. The most critical risk is the regulatory capital regime: proposed Basel III Endgame rules, if implemented as drafted, could require JPM to hold meaningfully more capital, compressing ROTCE. Deal attractiveness is Neutral — outstanding franchise quality is offset by regulatory overhang, late-cycle credit normalization, and valuation at ~2.0x tangible book that limits upside for a potential acquirer.',
      financialHealth:
        '## Revenue Trend\n- FY2024 net revenue: $177.6B (+11% YoY)\n- Net interest income: $92.6B; noninterest revenue: $85.0B\n- Revenue growth driven by higher rates and First Republic integration\n\n## Profitability\n- Net income: $58.5B; EPS: $19.75\n- ROTCE: 21% (target: 17% through-the-cycle)\n- Efficiency ratio: 51% (industry-leading)\n\n## Cash Flow Quality\n- Common Equity Tier 1 (CET1) ratio: 15.7% (well above 11.9% regulatory minimum)\n- Tangible book value per share: $97.13\n\n## Debt & Liquidity\n- Total assets: $3.9T\n- Long-term debt: $302B\n- HQLA (liquidity buffer): ~$1.5T\n\n**Verdict:** Best-in-class financial institution with superior returns and capital generation; credit cycle normalization bears monitoring.',
      riskFactors: [
        {
          name: 'Basel III Endgame Capital Requirements',
          description:
            'Proposed rules would increase RWA and compress ROTCE; re-proposal expected but final form uncertain — creates multi-year strategic planning uncertainty.',
          impact: 'High',
        },
        {
          name: 'Credit Normalization',
          description:
            'Consumer net charge-off rate rising toward historical norms; credit card NCO rate of 3.5% in 2024 expected to increase if unemployment rises, pressuring provisions.',
          impact: 'High',
        },
        {
          name: 'Interest Rate Sensitivity',
          description:
            'NII highly sensitive to rate path; Fed rate cuts reduce asset yields faster than deposit repricing benefit fades, creating near-term NII headwinds.',
          impact: 'Medium',
        },
        {
          name: 'Geopolitical & Macro Exposure',
          description:
            'Global IB and trading revenues correlated with deal activity and market volatility; prolonged geopolitical instability or recession suppresses fee income.',
          impact: 'Medium',
        },
        {
          name: 'Cybersecurity & Operational Risk',
          description:
            'As the largest U.S. bank, JPM is a priority target for state-sponsored cyber actors; a material breach could trigger regulatory action and reputational damage.',
          impact: 'Medium',
        },
      ],
      redFlags:
        '## Red Flag Assessment\n\n**Low severity — no disqualifying flags.** Observations:\n\n- No going concern issues; capital ratios well above minimums\n- Internal controls: effective; no material weaknesses\n- Active regulatory matters: CFPB inquiry re: Zelle fraud handling; ongoing Basel III re-proposal — neither rises to deal-breaker level\n- CEO succession: Jamie Dimon, 68, has not named a clear successor; management depth is strong but key-person consideration for any acquirer\n- First Republic integration progressing; no unexpected credit deterioration in acquired book disclosed\n\n**Monitoring items:**\n- Zelle regulatory outcome\n- CRE office exposure ($17B) in a distressed market',
      competitivePosition:
        '## Primary Markets & Segments\n- Consumer & Community Banking (CCB), Commercial Banking (CB), Corporate & Investment Bank (CIB), Asset & Wealth Management (AWM)\n\n## Competitive Advantages\n1. Scale: $3.9T in assets creates funding cost, distribution, and data advantages no challenger can replicate\n2. Investment banking franchise: #1 globally by wallet share for 5 consecutive years\n3. Technology investment: $17B annual technology spend — largest of any bank globally\n4. Cross-sell engine: Consumer-to-commercial pipeline drives relationship depth\n\n## Key Competitors\n- Bank of America, Citigroup, Wells Fargo (domestic), Goldman Sachs, Morgan Stanley (IB/wealth)\n\n## Market Position\n**Leader** — #1 U.S. bank by assets, deposits, and investment banking revenue\n\n## Strategic Initiatives\n- Payments modernization (real-time payments, ACH modernization)\n- AWM growth: targeting $5T in client assets\n- AI deployment: 2,000+ AI use cases in production across the firm',
    },
  },
  TSLA: {
    metadata: {
      companyName: 'Tesla, Inc.',
      ticker: 'TSLA',
      cik: '0001318605',
      filingDate: '2025-01-29',
      fiscalYearEnd: 'December 31, 2024',
      filingType: '10-K',
      secUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=10-K',
    },
    memo: {
      dealSignal: 'Cautious',
      executiveSummary:
        'Tesla is the global EV market pioneer operating across automotive manufacturing, energy generation/storage, and autonomous driving software — a highly complex, capital-intensive business in a rapidly commoditizing category. FY2024 automotive revenue declined as average selling prices fell ~15% YoY to defend market share against Chinese competitors, compressing auto gross margins to ~17.1% from 25%+ at peak. The most critical risk is the structural margin deterioration in the core automotive segment combined with intensifying competition from BYD and Chinese OEMs that are entering Western markets with cost structures Tesla cannot match. Deal attractiveness is Cautious — the autonomous driving / Robotaxi optionality is real but unproven, while near-term fundamentals are deteriorating and CEO concentration risk is acute.',
      financialHealth:
        '## Revenue Trend\n- FY2024 total revenue: $97.7B (+1.1% YoY from $96.8B) — deceleration from 19% in FY2023\n- Automotive revenue: $77.1B (–6.5% YoY); Energy & Storage: $10.1B (+67% YoY); Services: $10.5B (+27%)\n- Revenue flat despite volume growth — ASP compression driving the divergence\n\n## Profitability\n- Automotive gross margin: ~17.1% (vs. 25.6% in FY2022)\n- Total gross margin: 19.8%\n- Operating margin: 7.3% (vs. 9.2% prior year)\n- Net income: $7.1B (–53% YoY); adjusted for one-time items ~$9.8B\n\n## Cash Flow Quality\n- Operating cash flow: $14.9B\n- Free cash flow: $3.6B (capex $11.3B — heavy investment cycle)\n- FCF significantly lower than net income — high capex intensity is structural\n\n## Debt & Liquidity\n- Cash and equivalents: $36.6B\n- Long-term debt: $7.7B (well-managed)\n- Net cash positive: ~$29B\n\n**Verdict:** Financially sound balance sheet masks structural margin deterioration in core auto; Energy segment a genuine bright spot but insufficient to offset automotive headwinds.',
      riskFactors: [
        {
          name: 'Automotive Margin Compression',
          description:
            'Sustained price cuts to defend volume have reduced auto gross margins by >800bps from peak; further competition may require additional reductions with no clear floor.',
          impact: 'High',
        },
        {
          name: 'CEO Concentration & Distraction Risk',
          description:
            'Elon Musk's simultaneous leadership of SpaceX, xAI, X (Twitter), and DOGE advisory role creates bandwidth and reputational risks that directly affect Tesla's brand and governance.',
          impact: 'High',
        },
        {
          name: 'Chinese EV Competition',
          description:
            'BYD, Nio, and Li Auto are expanding globally with lower-cost products; in China — Tesla's most important margin market — BYD surpassed Tesla in EV sales in 2023.',
          impact: 'High',
        },
        {
          name: 'FSD / Autonomous Regulatory Risk',
          description:
            'Full Self-Driving commercial deployment requires NHTSA/NHTSB approval; accidents, investigations, or regulatory delays could impair the core long-term thesis.',
          impact: 'High',
        },
        {
          name: 'Cybertruck & New Model Execution Risk',
          description:
            'Cybertruck production ramp facing quality issues; delayed Model 2 (affordable EV) launch creates a volume gap in the highest-demand price segment.',
          impact: 'Medium',
        },
      ],
      redFlags:
        '## Red Flag Assessment\n\n**Multiple monitoring items — elevated caution warranted:**\n\n1. **NHTSA Investigations**: Multiple active safety investigations into Autopilot/FSD; several recalls executed. Pattern of regulatory scrutiny is unusual in depth and frequency.\n\n2. **CEO Reputational Risk**: Elon Musk's public statements have triggered advertiser boycotts (at X), brand perception deterioration, and employee morale issues. Several brand surveys show Tesla brand favorability declining in key demographics.\n\n3. **Related-Party Transactions**: Transactions with SpaceX (component supply, Starlink integration) require ongoing monitoring for arm's-length pricing; Board has historically limited independence.\n\n4. **Warranty & Product Liability Exposure**: Cybertruck quality issues and Autopilot litigation create contingent liabilities not fully quantified in filing.\n\n5. **No material weakness or going concern** — balance sheet is strong and no auditor qualification.\n\n**Overall**: No deal-breakers, but the concentration of risk in one individual (CEO) is an unusual due diligence consideration that would require specific deal structuring (retention, governance).',
      competitivePosition:
        '## Primary Markets & Segments\n- Battery electric vehicles (Model S/X/3/Y/Cybertruck), Energy Generation (Powerwall, Megapack), FSD software, Supercharger network\n\n## Competitive Advantages\n1. Supercharger network: 60,000+ chargers globally — largest proprietary network; now open to competitors (licensing revenue)\n2. Software OTA: Only major OEM with true over-the-air feature updates, enabling post-sale monetization\n3. Vertical integration: In-house battery, chip (Dojo), motor, and software development\n4. Energy segment: Megapack backlog >$10B — fastest-growing and highest-margin trajectory\n\n## Key Competitors\n- BYD, Volkswagen ID. series, GM Ultium, Ford Lightning, Rivian (trucks), Waymo (autonomous)\n\n## Market Position\n**Challenged Leader** — pioneered category but losing share in key markets; still #1 BEV brand in U.S. but margin leadership gone\n\n## Strategic Initiatives\n- Robotaxi / Cybercab launch (2025–2026 target): autonomous ride-hail as revenue diversification\n- Optimus humanoid robot: speculative but significant long-term TAM\n- Megapack capacity expansion: 40 GWh Lathrop gigafactory ramping',
    },
  },
};

export const ANALYSIS_STEPS = [
  { progress: 0.1, label: '🔍 Looking up company on SEC EDGAR...' },
  { progress: 0.25, label: '📥 Downloading 10-K filing...' },
  { progress: 0.4, label: '✂️  Chunking and embedding filing text...' },
  { progress: 0.55, label: '💰 Analyzing financial health...' },
  { progress: 0.65, label: '⚠️  Identifying risk factors...' },
  { progress: 0.75, label: '🚩 Scanning for red flags...' },
  { progress: 0.85, label: '🏆 Assessing competitive position...' },
  { progress: 0.95, label: '📝 Writing executive summary...' },
  { progress: 1.0, label: '✅ Report complete!' },
];
