/**
 * Assets Manifest - maps folders to file lists
 * Since browser JS cannot list local folders, this manifest acts as a registry.
 */
const assetsManifest = {
    "assets/ARW_Toolkit": [
        "assets/ARW_Toolkit/ARW_Toolkit_a1.png",
        "assets/ARW_Toolkit/ARW_Toolkit_a2.png"
    ],
    "assets/Backrooms_3D": [
        "assets/Backrooms_3D/preview.png"
    ],
    "assets/ChainReactionWD": [
        "assets/ChainReactionWD/preview.png"
    ],
    "assets/GlitchStudio": [
        "assets/GlitchStudio/Glitch Studio (1).png",
        "assets/GlitchStudio/Glitch Studio (2).png"
    ],
    "assets/GravitySimulator": [
        "assets/GravitySimulator/preview.png"
    ],
    "assets/LogoVectorWD": [
        "assets/LogoVectorWD/preview.png"
    ],
    "assets/MemoCard": [
        "assets/MemoCard/preview.png"
    ],
    "assets/PerlinNoise": [
        "assets/PerlinNoise/preview.png"
    ],
    "assets/PharmaSignWD": [
        "assets/PharmaSignWD/preview.png"
    ],
    "assets/RadioactiveHex": [
        "assets/RadioactiveHex/preview.png"
    ],
    "assets/RailwayNetwork": [
        "assets/RailwayNetwork/railway_network.png"
    ],
    "assets/RegExWD": [
        "assets/RegExWD/preview.png"
    ],
    "assets/TextLab": [
        "assets/TextLab/TextLab.png"
    ],
    "assets/TransmutationCircle": [
        "assets/TransmutationCircle/tc_1.png",
        "assets/TransmutationCircle/tc_2.png"
    ]
};

const projects = [
    {
        title: "Transmutation Circle",
        description: "A professional alchemical design studio for creating intricate geometric patterns inspired by Fullmetal Alchemist.",
        longDescription: "Transmutation Circle is a powerful web-based application that allows users to design and generate complex alchemical circles. It features a modular SVG engine, customizable layers, and real-time rendering. Perfect for artists, designers, and fans of the series who want to explore geometric alchemy.",
        url: "https://wowkdigital.github.io/TransmutationCircle/",
        github: "https://github.com/WowkDigital/TransmutationCircle",
        icon: "flask-conical",
        color: "red-500",
        effect: "hueRotate",
        imageFolder: "assets/TransmutationCircle"
    },
    {
        title: "Collage Creator",
        description: "A powerful tool for creating creative compositions and photo collages directly in the browser.",
        longDescription: "Collage Creator is a professional-grade tool designed for photographers and digital artists. It offers a drag-and-drop interface, multiple layout templates, and advanced filter options. Users can export their creations in high-resolution formats suitable for both web and print.",
        url: "https://wowkdigital.github.io/CollageCreator/",
        github: "https://github.com/WowkDigital/CollageCreator",
        icon: "layout-grid",
        color: "primary",
        images: ["https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800"]
    },
    {
        title: "ARW Toolkit",
        description: "A set of tools dedicated to working with Sony raw files (ARW). Automate and optimize your photography workflow.",
        longDescription: "The ARW Toolkit is a specialized utility for Sony camera users. It provides tools for batch processing, metadata extraction, and preview generation of Sony ARW files. It's built to streamline the professional photography workflow by automating repetitive tasks.",
        url: "https://wowkdigital.github.io/ARW_Toolkit/",
        github: "https://github.com/WowkDigital/ARW_Toolkit",
        icon: "camera",
        color: "secondary",
        imageFolder: "assets/ARW_Toolkit"
    },
    {
        title: "Grapher 10",
        description: "Intuitive graph and data visualization generator. Export beautiful, publication-ready graphics for your reports.",
        longDescription: "Grapher 10 is an advanced data visualization platform. It supports various chart types including line, bar, pie, and radar. With its intuitive interface and deep customization options, it enables users to turn complex datasets into beautiful, understandable visual stories.",
        url: "https://wowkdigital.github.io/grapher_10/",
        github: "https://github.com/WowkDigital/grapher_10",
        icon: "bar-chart-3",
        color: "accent"
    },
    {
        title: "Glitch Studio",
        description: "Experimental graphics effects studio. Destroy, deform and create unique glitch art effects with precision.",
        longDescription: "Glitch Studio is an experimental playground for digital art. It uses advanced canvas manipulation techniques to create intentional artifacts, RGB splits, and data moshing effects. Every result is unique and can be captured as high-quality image or video loops.",
        url: "https://wowkdigital.github.io/glitch_studio/",
        github: "https://github.com/WowkDigital/glitch_studio",
        icon: "zap",
        color: "indigo-400",
        effect: "glitch",
        images: [],
        imageFolder: "assets/GlitchStudio"
    },
    {
        title: "Photo Compress",
        description: "Fast and efficient image compression tool. Reduce file size while maintaining high quality directly in your browser.",
        longDescription: "Photo Compress utilizes modern compression algorithms to drastically reduce image file sizes without noticeable quality loss. It runs entirely in the browser, ensuring privacy and speed. Perfect for web developers and social media managers who need to optimize content on the fly.",
        url: "https://wowkdigital.github.io/photo_compress/",
        github: "https://github.com/WowkDigital/photo_compress",
        icon: "file-image",
        color: "emerald-400"
    },
    {
        title: "Matrix Effect",
        description: "Digital rain and matrix-style terminal animations. Customizable visual effects for cyberpunk aesthetics.",
        longDescription: "A faithful recreation of the iconic 'Matrix' digital rain. This project is highly customizable, allowing users to change characters, colors, speed, and density. It's built with performance in mind, using optimized canvas rendering to ensure smooth animations even on low-end devices.",
        url: "https://wowkdigital.github.io/matrix/",
        github: "https://github.com/WowkDigital/matrix",
        icon: "terminal",
        color: "lime-400",
        effect: "matrix"
    },
    {
        title: "Tile Generator",
        description: "Create seamless, high-quality tiled backgrounds and patterns for web and graphic design projects.",
        longDescription: "Tile Generator is a specialized tool for creating repeatable patterns. It automatically handles edge matching and seamless transitions. Users can export tiles in various sizes and formats, making it an essential tool for UI/UX designers and web developers.",
        url: "https://wowkdigital.github.io/TileBackgroundGenerator/",
        github: "https://github.com/WowkDigital/TileBackgroundGenerator",
        icon: "layout-template",
        color: "sky-400"
    },
    {
        title: "Organic Patterns",
        description: "Generate unique organic shapes and abstract patterns with fluid motion and artistic flair.",
        longDescription: "Inspired by biological forms and fluid dynamics, Organic Patterns generates mesmerizing, living visuals. It uses perlin noise and particle systems to create shapes that feel natural and alive. Users can interact with the patterns in real-time.",
        url: "https://wowkdigital.github.io/organic_pattern_generator/",
        github: "https://github.com/WowkDigital/organic_pattern_generator",
        icon: "infinity",
        color: "rose-400",
        effect: "neon"
    },
    {
        title: "PDF Extractor",
        description: "Extract high-resolution images from PDF files quickly and easily, directly within your browser.",
        longDescription: "PDF Extractor simplifies the process of getting images out of PDF documents. It scans PDFs for embedded image data and allows users to download them in their original quality. No server-side processing is required, making it fast and secure.",
        url: "https://wowkdigital.github.io/pdf_extract_images/",
        github: "https://github.com/WowkDigital/pdf_extract_images",
        icon: "file-output",
        color: "orange-400",
        effect: "shake"
    },
    {
        title: "TextLab",
        description: "Advanced text analysis and processing utility. Real-time statistics, character limits, and intelligent text segmentation.",
        longDescription: "TextLab is a comprehensive suite of text manipulation tools. From simple character counting to complex regex operations and sentiment analysis, it provides a centralized workspace for anyone working with large amounts of text data.",
        url: "https://wowkdigital.github.io/TextLab/",
        github: "https://github.com/WowkDigital/TextLab",
        icon: "file-text",
        color: "amber-400",
        effect: "hueRotate",
        images: [],
        imageFolder: "assets/TextLab"
    },
    {
        title: "WD Footer",
        description: "A lightweight, customizable branded footer for Wowk Digital projects. Easy to integrate with dynamic links.",
        longDescription: "WD Footer is a reusable web component designed to provide a consistent branding experience across all Wowk Digital projects. It's lightweight, customizable, and features built-in support for social links and copyright notices.",
        url: "https://github.com/WowkDigital/WowkDigitalFooter",
        github: "https://github.com/WowkDigital/WowkDigitalFooter",
        icon: "panel-bottom",
        color: "cyan-400"
    },
    {
        title: "1D Automata",
        description: "Explore the fascinating world of 1D cellular automata. Visualize patterns emerging from simple mathematical rules.",
        longDescription: "1D Automata is an educational tool for exploring Stephen Wolfram's cellular automata rules. It visualizes how simple local rules can lead to complex global behaviors. It's a tribute to the beauty of mathematical emergence and chaos theory.",
        url: "https://wowkdigital.github.io/1D_automata/",
        github: "https://github.com/WowkDigital/1D_automata",
        icon: "binary",
        color: "blue-400"
    },
    {
        title: "Railway Network",
        description: "An advanced procedural railway network generator built with Vanilla JavaScript and HTML5 Canvas.",
        longDescription: "Railway Network is a sophisticated simulation tool that generates unique, efficient transit layouts using geometric algorithms. It features topological optimization (2-opt/Or-opt), smart connectivity via Union-Find, and physical track constraints to ensure realistic and traversable networks. Perfect for urban planning enthusiasts and fans of procedural generation.",
        url: "https://wowkdigital.github.io/railway_network/",
        github: "https://github.com/WowkDigital/railway_network",
        icon: "train",
        color: "blue-500",
        effect: "neon",
        imageFolder: "assets/RailwayNetwork"
    },
    {
        title: "Gravity Simulator",
        description: "A high-performance N-body gravity simulator for visualizing complex celestial mechanics and orbital dynamics.",
        longDescription: "Gravity Simulator is an advanced physics-based application designed to simulate gravitational interactions between multiple celestial bodies. Built with a custom physics engine, it features real-time orbital calculations, planetary system creation, and stunning visual representations of gravitational fields. Ideal for students, educators, and space enthusiasts exploring the beauty of orbital mechanics.",
        url: "https://wowkdigital.github.io/GravitySimulatorWD/",
        github: "https://github.com/WowkDigital/GravitySimulatorWD",
        icon: "orbit",
        color: "purple-500",
        effect: "hueRotate",
        imageFolder: "assets/GravitySimulator"
    },
    {
        title: "Perlin Noise",
        description: "A premium, interactive web-based visualization tool for exploring multi-dimensional Perlin Noise and Fractional Brownian Motion (fBm).",
        longDescription: "PERLIN//NOISE Explorer is a high-performance web-based visualization tool designed for exploring multi-dimensional Perlin Noise and Fractional Brownian Motion (fBm). It features 8 advanced noise visualization modes (including Terrain, Plasma, Marble, Flow, Domain Warp, and more), interactive HSL-balanced color palettes, real-time parameters tweaking, smooth zoom and pan controls, and a custom schema-based state sharing system that serializes settings directly into the URL.",
        url: "https://wowkdigital.github.io/PerlinNoiseWD/",
        github: "https://github.com/WowkDigital/PerlinNoiseWD",
        icon: "waves",
        color: "indigo-500",
        effect: "hueRotate",
        imageFolder: "assets/PerlinNoise"
    },
    {
        title: "Logo Vector",
        description: "A minimalist, high-fidelity repository holding the official vector logo for WowkDigital.",
        longDescription: "Logo Vector is an interactive asset platform holding the official vector logo for WowkDigital. Designed with maximum pixel precision, it offers real-time rendering, custom color selection, dynamic background swatches, scalable PNG/SVG downloads, and ready-to-use developer integration snippets for HTML, CSS, SVG, and React.",
        url: "https://wowkdigital.github.io/LogoVectorWD/",
        github: "https://github.com/WowkDigital/LogoVectorWD",
        icon: "pen-tool",
        color: "slate-400",
        effect: "hueRotate",
    },
    {
        title: "PHARMA-SIGN",
        description: "An interactive, premium-grade LED Matrix Simulator specifically tailored for pharmacy cross-shaped displays.",
        longDescription: "PHARMA-SIGN is an interactive, premium-grade LED Matrix Simulator specifically tailored for pharmacy cross-shaped displays. Designed with a sleek, responsive Tailwind UI, this simulator offers 11 dynamic animation modes (including ECG, Wave, Spiral, Snake, and custom drawings), customizable LED colors, Night Mode, and real-time power consumption diagnostics.",
        url: "https://wowkdigital.github.io/PharmaSignWD/",
        github: "https://github.com/WowkDigital/PharmaSignWD",
        icon: "activity",
        color: "emerald-500",
        effect: "hueRotate",
        imageFolder: "assets/PharmaSignWD"
    },
    {
        title: "Radioactive Hex",
        description: "An advanced, real-time radiation dispersion simulator with a hexagonal axial coordinate system, dynamic wind vectors, and geiger audio feedback.",
        longDescription: "Radioactive Hex (RadMap-V2) is an interactive, premium-grade radiation dispersion simulator utilizing an axial-coordinate hexagonal grid system. It models physical decay, real-time diffusion, and environmental wind vector drift. Users can paint radioactive contamination, select isotope presets (Iodine-131, Cesium-137, Cobalt-60, Plutonium-239), simulate continuous leaks or blast releases, and analyze dynamic metrics with a real-time historical timeline chart and spatial audio Geiger acoustics.",
        url: "https://wowkdigital.github.io/RadioactiveHexWD/",
        github: "https://github.com/WowkDigital/RadioactiveHexWD",
        icon: "radio",
        color: "emerald-500",
        effect: "hueRotate",
        imageFolder: "assets/RadioactiveHex"
    },
    {
        title: "MemoCard",
        description: "A minimalist, responsive progressive web app (PWA) for fast vocabulary learning using Spaced Repetition (SRS) with Firebase.",
        longDescription: "MemoCard is an interactive, premium-grade flashcard application designed for rapid vocabulary learning. Built with an offline-first architecture, it uses the SuperMemo-2 (SM-2) spaced repetition algorithm to schedule reviews dynamically based on difficulty. Features include a sleek dark glassmorphic user interface, smooth 3D card-flip animations, Google Firebase authentication, cloud Firestore synchronization, CSV/JSON deck import, shared deck cloning, and detailed learning statistics.",
        url: "https://memocard-79e05.web.app/",
        github: "https://github.com/WowkDigital/MemoCard",
        icon: "layers",
        color: "indigo-500",
        effect: "hueRotate",
        imageFolder: "assets/MemoCard"
    },
    {
        title: "Quantum Chain Reaction",
        description: "An interactive, high-performance quantum particle and chain reaction simulation built with HTML5 Canvas.",
        longDescription: "Quantum Chain Reaction is an interactive physics simulation exploring particle collisions, dynamic speed scaling, and molecular combinations. Built with a custom physics engine and HTML5 Canvas, it features a glassmorphic real-time telemetry dashboard, discovery charts, and organic visuals.",
        url: "https://wowkdigital.github.io/ChainReactionWD/",
        github: "https://github.com/WowkDigital/ChainReactionWD",
        icon: "atom",
        color: "amber-500",
        effect: "hueRotate",
        imageFolder: "assets/ChainReactionWD"
    },
    {
        title: "Backrooms 3D",
        description: "Explore the endless hallways of the Backrooms in an immersive 3D simulation built with Three.js.",
        longDescription: "Backrooms 3D is an immersive first-person 3D simulator of the infamous 'Backrooms' creepypasta. Built with Three.js and HTML5 Canvas, it features procedurally generated infinite mazes, realistic retro VHS shader glitch effects, eerie ambient audio, dynamic lighting, and an autonomous bot navigation mode for hands-free maze exploration and mapping.",
        url: "https://wowkdigital.github.io/Backrooms_3D/",
        github: "https://github.com/WowkDigital/Backrooms_3D",
        icon: "ghost",
        color: "yellow-500",
        effect: "glitch",
        imageFolder: "assets/Backrooms_3D"
    },
    {
        title: "RegEx Lab",
        description: "An interactive, premium-grade regular expressions laboratory for learning, testing, and mastering regex patterns in real-time.",
        longDescription: "RegEx Lab is an interactive learning platform and testing playground for regular expressions. Built with a premium glassmorphic UI, it features structured lessons with multiple exercises per lesson, real-time match highlighting, instant test suite validation, an interactive cheatsheet, and persistent progress tracking.",
        url: "https://wowkdigital.github.io/RegExWD/",
        github: "https://github.com/WowkDigital/RegExWD",
        icon: "braces",
        color: "fuchsia-500",
        effect: "glitch",
        imageFolder: "assets/RegExWD"
    }
];

if (typeof module !== 'undefined') {
    module.exports = { assetsManifest, projects };
}
