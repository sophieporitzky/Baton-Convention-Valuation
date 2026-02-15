import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Upload, FileText, 
  Plus, Trash2, Loader, CheckCircle, AlertCircle, RotateCcw,
  Building2, DollarSign, Users, BarChart3, X, ArrowLeft
} from "lucide-react";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const INDUSTRIES = [
  "Restaurant / Food Service",
  "Retail",
  "Professional Services",
  "Healthcare / Medical",
  "Technology / SaaS",
  "Construction / Trades",
  "Manufacturing",
  "E-commerce / Online",
  "Home Services",
  "Automotive",
  "Beauty / Personal Care",
  "Fitness / Wellness",
  "Education / Tutoring",
  "Real Estate Services",
  "Other"
];

// Sub-industry options for Construction / Trades — each maps to NAICS code prefixes
const CONSTRUCTION_SUB_INDUSTRIES = [
  { label: "HVAC / Mechanical", naics: [238220] },
  { label: "Electrical", naics: [238210] },
  { label: "Plumbing", naics: [238220] },
  { label: "Roofing / Siding / Exteriors", naics: [238160, 238170, 238190, 238150] },
  { label: "Painting / Coatings", naics: [238320, 238330, 238340] },
  { label: "Flooring / Tile", naics: [238330, 238340] },
  { label: "Concrete / Masonry", naics: [238110, 238140] },
  { label: "Insulation / Drywall", naics: [238310, 238350] },
  { label: "Home Remodeling / Residential GC", naics: [236118, 236115, 236117] },
  { label: "Commercial General Contractor", naics: [236220, 236210] },
  { label: "Demolition / Excavation / Site Prep", naics: [238910] },
  { label: "Landscaping / Lawn Care", naics: [561730] },
  { label: "Paving / Heavy Civil / Utilities", naics: [237130, 237310, 237990, 237110] },
  { label: "Building Materials / Supply", naics: [444180, 423300, 423300, 449100] },
  { label: "Pest Control / Remediation", naics: [561710, 562910] },
  { label: "Fencing / Gates / Specialty Install", naics: [238990, 238290, 238390] },
  { label: "Other Construction Trade", naics: [238990] }
];
// Compressed comps database: n=NAICS, d=description, s=state, y=year, r=revenue, e=SDE, m=multiple
const COMPS_DATA = [{"n":238290,"d":"Commercial and Industrial Garage Door Sales and Maintenance","s":"QC","y":2025,"r":1900304,"e":379100,"m":3.03},{"n":236118,"d":"Home Remodeling Business","s":"MN","y":2025,"r":2072755,"e":232054,"m":1.29},{"n":236118,"d":"Home Remodeling Business","s":"MN","y":2025,"r":2072755,"e":232054,"m":1.29},{"n":238990,"d":"Asphalt Sealcoating Company","s":"FL","y":2025,"r":1064584,"e":302000,"m":2.32},{"n":561730,"d":"Landscaping and Irrigation Contractor (Home-Based Business)","s":"FL","y":2025,"r":1200374,"e":101666,"m":5.16},{"n":561730,"d":"Landscaping and Irrigation Contractor (Home-Based Business)","s":"FL","y":2025,"r":1200374,"e":101666,"m":5.16},{"n":238990,"d":"Asphalt Sealcoating Company","s":"FL","y":2025,"r":1064584,"e":302000,"m":2.32},{"n":238910,"d":"Demolition and Excavation Compan","s":"TX","y":2025,"r":1237000,"e":500000,"m":3.2},{"n":238910,"d":"Demolition and Excavation Compan","s":"TX","y":2025,"r":1237000,"e":500000,"m":3.2},{"n":423310,"d":"Lumber and Building Materials Supplier","s":"FL","y":2025,"r":11712819,"e":556171,"m":3.6},{"n":238320,"d":"Painting Contractor","s":"MO","y":2025,"r":593008,"e":97188,"m":1.8},{"n":238320,"d":"Established Painting Franchise (Home-Based Business)","s":"UT","y":2025,"r":1194000,"e":200000,"m":2.0},{"n":238220,"d":"Commercial Heating, Ventilation, and Air Conditioning (HVAC) Contractor (Home-Ba","s":"AZ","y":2025,"r":1610000,"e":346000,"m":2.75},{"n":236220,"d":"Multi-State Improvement Construction Company","s":"WV","y":2025,"r":1504922,"e":317643,"m":2.2},{"n":562111,"d":"Landscaping Design And Construction Company","s":"","y":2025,"r":2950095,"e":207151,"m":4.22},{"n":238160,"d":"Auto Repair And Tire Shop","s":"","y":2025,"r":2296624,"e":223514,"m":4.25},{"n":236118,"d":"Handyman and Remodeling Contractor","s":"","y":2025,"r":2362035,"e":101992,"m":5.88},{"n":237990,"d":"Dock andBoat-Lift Company","s":"MN","y":2025,"r":829878,"e":410422,"m":5.67},{"n":236220,"d":"Construction Project Services From Tenant Improvements to New Construction","s":"MN","y":2025,"r":4937823,"e":514019,"m":2.04},{"n":238160,"d":"Roofing Contractor","s":"MD","y":2025,"r":408165,"e":75000,"m":1.23},{"n":238150,"d":"Exterior Installer of Windows and Doors","s":"MN","y":2025,"r":3914753,"e":413084,"m":2.54},{"n":238330,"d":"Specialty Epoxy/Resin Flooring Contractor","s":"FL","y":2025,"r":1177406,"e":427710,"m":2.34},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"OK","y":2025,"r":496179,"e":94205,"m":1.91},{"n":238330,"d":"Flooring Contractor","s":"","y":2025,"r":1130712,"e":222694,"m":3.14},{"n":238160,"d":"Residential Roofing Contractor (Home-Based Business)","s":"FL","y":2025,"r":3905278,"e":562067,"m":2.67},{"n":237110,"d":"Underground Wet Utility Construction Company","s":"ID","y":2025,"r":19386774,"e":5517508,"m":3.44},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"AZ","y":2025,"r":553558,"e":94816,"m":1.58},{"n":238990,"d":"Construction of Outdoor Structures","s":"NJ","y":2025,"r":1052508,"e":351393,"m":3.27},{"n":236115,"d":"Pool Builder","s":"FL","y":2025,"r":11758817,"e":2727198,"m":1.58},{"n":423730,"d":"Distributor of Heating, Ventilation, and Air Conditioning (HVAC) and Fire Suppre","s":"IN","y":2025,"r":2888348,"e":1088489,"m":3.26},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"MI","y":2025,"r":2354425,"e":488981,"m":3.32},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (90% Residential, 10% Commerci","s":"FL","y":2025,"r":593543,"e":164387,"m":3.04},{"n":238220,"d":"Commercial Plumbing and Fire Protection Company","s":"FL","y":2025,"r":1818870,"e":549249,"m":1.46},{"n":561730,"d":"Landscape Construction and Maintenance Business","s":"NY","y":2025,"r":1750000,"e":600000,"m":2.92},{"n":238220,"d":"Provides Irrigation Design, Installation, and Maintenance Services","s":"FL","y":2025,"r":3949518,"e":1526535,"m":2.1},{"n":561730,"d":"Residential Lawn Care and Landscaping Business","s":"FL","y":2025,"r":90000,"e":65000,"m":0.92},{"n":238990,"d":"Swimming Pool Construction","s":"UT","y":2025,"r":2265403,"e":444028,"m":3.15},{"n":541511,"d":"Government Contractor Specializing in Programming, Information Technology (IT), ","s":"DC","y":2025,"r":1380000,"e":225000,"m":4.44},{"n":423390,"d":"Wholesale Distributor of Construction Material","s":"CO","y":2025,"r":6680653,"e":867107,"m":3.75},{"n":238210,"d":"Residential, Commercial, and Industrial Electrical Contractor (Home-Based Busine","s":"NY","y":2025,"r":1267623,"e":450000,"m":3.06},{"n":236118,"d":"Residential Remodeler","s":"FL","y":2025,"r":2297255,"e":366051,"m":0.41},{"n":561730,"d":"Landscaping Business","s":"FL","y":2025,"r":343687,"e":91167,"m":2.66},{"n":236118,"d":"Home Remodeler","s":"OH","y":2025,"r":985000,"e":130000,"m":3.08},{"n":236118,"d":"Disaster Mitigation, Restoration, and Home Improvement Business","s":"VA","y":2025,"r":4499439,"e":529496,"m":2.74},{"n":238210,"d":"Solar Panel Installation Company","s":"CO","y":2025,"r":6380513,"e":1498153,"m":2.27},{"n":237110,"d":"Water Well Drilling Business","s":"WI","y":2025,"r":5511120,"e":1805493,"m":2.22},{"n":238990,"d":"Fencing Company","s":"MA","y":2025,"r":943094,"e":228228,"m":1.97},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Company","s":"BC","y":2025,"r":3436991,"e":534404,"m":1.12},{"n":442110,"d":"Slumberland  Mattresses and Other Home Furnishings Franchise","s":"","y":2025,"r":1833110,"e":128378,"m":3.51},{"n":237310,"d":"Full Service Asphalt and Concrete Company","s":"OH","y":2025,"r":2271825,"e":354959,"m":2.34},{"n":561730,"d":"Lawn Care and Landscaping Business","s":"FL","y":2025,"r":65000,"e":60000,"m":0.67},{"n":238210,"d":"Residential, Commercial, and Industrial Electrical Contractor (Home-Based Busine","s":"MN","y":2025,"r":508605,"e":189676,"m":1.32},{"n":238910,"d":"Florida Land Clearing and Site Work (Home-Based Business)","s":"FL","y":2025,"r":161173,"e":81172,"m":3.7},{"n":236118,"d":"Home-Improvement Service","s":"FL","y":2025,"r":51773,"e":24033,"m":1.46},{"n":541330,"d":"Construction Company","s":"FL","y":2025,"r":122820,"e":72467,"m":4.14},{"n":561730,"d":"Landscaping Business","s":"FL","y":2025,"r":138414,"e":77564,"m":1.1},{"n":561730,"d":"Residential Lawn Care and Landscaping Business","s":"FL","y":2025,"r":120000,"e":72000,"m":1.04},{"n":237310,"d":"Asphalt Paving and Repair Company","s":"FL","y":2025,"r":1257319,"e":427228,"m":3.11},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2025,"r":1005977,"e":148236,"m":1.11},{"n":238160,"d":"Roofing Contractor also offering Painting and Drywall","s":"FL","y":2025,"r":837848,"e":284571,"m":2.02},{"n":238150,"d":"Residential and Commercial Glass Installations","s":"TN","y":2025,"r":1458000,"e":445000,"m":1.97},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2025,"r":7286305,"e":321838,"m":10.88},{"n":236118,"d":"Kitchen and Bath Business","s":"DE","y":2025,"r":3711298,"e":587621,"m":2.89},{"n":238110,"d":"Concrete Design Contractor","s":"NV","y":2025,"r":19000000,"e":4000000,"m":3.0},{"n":238220,"d":"Commercial and Residential Irrigation Business","s":"FL","y":2025,"r":1386226,"e":852996,"m":3.63},{"n":238310,"d":"Insulation Contractor","s":"FL","y":2025,"r":6091543,"e":1138777,"m":2.11},{"n":238910,"d":"Excavation and Site Development Company","s":"NY","y":2025,"r":2700000,"e":1152000,"m":2.86},{"n":238110,"d":"Concrete Contractor","s":"ID","y":2025,"r":813334,"e":285026,"m":2.25},{"n":238220,"d":"Residential Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2025,"r":2266116,"e":861307,"m":3.48},{"n":561730,"d":"Residential Lawn Care and Landscaping Business","s":"FL","y":2025,"r":3112609,"e":598973,"m":3.17},{"n":238220,"d":"Plumbing Business","s":"FL","y":2025,"r":1726322,"e":322839,"m":3.56},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (85% Residential, 15% Commerci","s":"FL","y":2025,"r":1548153,"e":414601,"m":3.74},{"n":238150,"d":"Glass and Window Installation and Repair Company","s":"OR","y":2025,"r":626622,"e":118869,"m":2.1},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2025,"r":386274,"e":45638,"m":1.53},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (95% Residential, 5% Commercia","s":"FL","y":2025,"r":819969,"e":183157,"m":2.73},{"n":236118,"d":"Bath and Kitchen Remodeling Business","s":"FL","y":2025,"r":3601587,"e":380884,"m":3.2},{"n":238220,"d":"Plumbing Company","s":"","y":2025,"r":10707775,"e":1981522,"m":2.78},{"n":238350,"d":"Closets, Blinds and Garage Pantry Storage Business","s":"MD","y":2025,"r":2125000,"e":500600,"m":3.9},{"n":238160,"d":"Roofing and Rain Screening Business","s":"CA","y":2025,"r":6157741,"e":1032385,"m":3.87},{"n":238350,"d":"Deck Builder (Home-Based Business)","s":"CO","y":2025,"r":1648932,"e":367913,"m":1.36},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Company","s":"CO","y":2025,"r":2107727,"e":711375,"m":3.23},{"n":236220,"d":"Commercial and Residential Remodeler","s":"FL","y":2025,"r":4096396,"e":534731,"m":2.06},{"n":238220,"d":"Industrial Mechanical and Heating, Ventilation, and Air Conditioning  (HVAC) Con","s":"TX","y":2025,"r":32293854,"e":4423907,"m":2.83},{"n":423320,"d":"Construction Materials Supplier","s":"OH","y":2025,"r":6699754,"e":1110392,"m":4.32},{"n":238150,"d":"Glass Contractor","s":"CA","y":2025,"r":1576558,"e":253515,"m":1.62},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (70% Residential, 30% Commerci","s":"FL","y":2025,"r":1919358,"e":96992,"m":3.61},{"n":335139,"d":"Manufacturer of Luxury Landscape Lighting","s":"HI","y":2025,"r":812319,"e":441738,"m":4.75},{"n":561730,"d":"Landscaping and Maintenance Business","s":"TX","y":2025,"r":658526,"e":181023,"m":2.21},{"n":561730,"d":"Landscape Installation and Maintenance Business (90% Residential, 10% Commercial","s":"FL","y":2025,"r":9627082,"e":1378003,"m":3.27},{"n":238310,"d":"Drywall Contractor","s":"FL","y":2025,"r":4276874,"e":1322680,"m":1.66},{"n":238220,"d":"Residential Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2025,"r":1398048,"e":133525,"m":2.62},{"n":561730,"d":"Landscaping Business","s":"WA","y":2025,"r":1927850,"e":441030,"m":2.72},{"n":238220,"d":"Plumbing Business (60% Commercial, 40% Residential)","s":"FL","y":2025,"r":958999,"e":265010,"m":1.51},{"n":238390,"d":"Interior Tenant Finish Contractor","s":"TX","y":2025,"r":4900000,"e":284000,"m":1.41},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (90% Residential an","s":"ON","y":2025,"r":1254000,"e":153451,"m":2.77},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (70% Residential, 30% Commerci","s":"FL","y":2025,"r":1430863,"e":198870,"m":2.26},{"n":561730,"d":"Landscaping and Snow Removal Company","s":"MT","y":2025,"r":1000600,"e":246500,"m":3.14},{"n":238210,"d":"Electrical Contracting Company","s":"FL","y":2025,"r":855000,"e":200000,"m":2.43},{"n":236118,"d":"Handyman, Residential Home Repair, and Maintenance","s":"CA","y":2025,"r":112118,"e":78401,"m":0.96},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Company","s":"ON","y":2025,"r":3595119,"e":701403,"m":3.99},{"n":236118,"d":"Residential Remodeler","s":"FL","y":2025,"r":431303,"e":75485,"m":1.13},{"n":238990,"d":"Parking Lot Maintenance Services","s":"CO","y":2025,"r":5394250,"e":1595519,"m":2.01},{"n":238220,"d":"Commercial Refrigeration Business","s":"FL","y":2025,"r":565266,"e":267519,"m":1.5},{"n":237110,"d":"Commerical Wastewater Treatment and Water Reclamation Contractor","s":"CA","y":2025,"r":5139455,"e":1657681,"m":3.38},{"n":238990,"d":"Specialty Contractor and Fabricator","s":"OR","y":2025,"r":4137245,"e":915500,"m":2.2},{"n":238170,"d":"Rain Gutter Wholesaler and Installer","s":"UT","y":2025,"r":2481000,"e":535000,"m":4.67},{"n":238990,"d":"Fencing Manufacturing, Installation and Service","s":"RI","y":2025,"r":975269,"e":265208,"m":1.89},{"n":423840,"d":"Construction Supply Distributor","s":"MN","y":2025,"r":1460000,"e":434000,"m":4.15},{"n":238220,"d":"Heating and Cooling Contractor","s":"AZ","y":2025,"r":779637,"e":173715,"m":3.34},{"n":561730,"d":"Residential Landscape Maintenance Company (Home-Based Business)","s":"AZ","y":2025,"r":252000,"e":98000,"m":1.73},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2025,"r":796697,"e":193394,"m":1.81},{"n":561730,"d":"Landscaping Business (Home-Based Business)","s":"TX","y":2025,"r":201500,"e":73000,"m":1.71},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"LA","y":2025,"r":1999000,"e":393000,"m":2.96},{"n":238220,"d":"Residential and Commercial Plumbing Company (Home-Based Business)","s":"CA","y":2025,"r":979157,"e":211619,"m":1.42},{"n":238990,"d":"Crane Service Contractor","s":"FL","y":2025,"r":4430184,"e":1464672,"m":4.15},{"n":541512,"d":"Technology Contractor for the Military","s":"CA","y":2025,"r":4879289,"e":1262223,"m":1.99},{"n":238210,"d":"Electrical Contractor Working with Marine Contractors, Pools and Spas, and Servi","s":"FL","y":2025,"r":500177,"e":124516,"m":3.6},{"n":238990,"d":"Outdoor Living Space Designer and Builder","s":"CO","y":2025,"r":2648638,"e":530508,"m":1.41},{"n":531311,"d":"Residential Property Management Business that also does Repairs and Remodels of ","s":"CA","y":2025,"r":878574,"e":444234,"m":3.83},{"n":238320,"d":"Painting Contractor","s":"FL","y":2025,"r":720256,"e":214240,"m":2.1},{"n":238140,"d":"Cemetery Monument Business","s":"GA","y":2025,"r":397423,"e":156680,"m":1.66},{"n":238990,"d":"Garage Floor Coating Franchise","s":"FL","y":2025,"r":1443271,"e":403005,"m":2.93},{"n":561790,"d":"Pool Renovation and Repair Business","s":"FL","y":2025,"r":3129648,"e":577367,"m":3.03},{"n":423720,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Wholesale Distributor","s":"NY","y":2025,"r":3081275,"e":548665,"m":3.7},{"n":561730,"d":"Commercial Landscaping Installation and Maintenance Business","s":"FL","y":2025,"r":8980439,"e":2603897,"m":3.53},{"n":236220,"d":"Construction Company (Home-Based Business)","s":"TX","y":2025,"r":761541,"e":203861,"m":3.41},{"n":238220,"d":"Air Conditioning Repair and Installation Services","s":"CA","y":2025,"r":1024336,"e":219314,"m":2.95},{"n":423390,"d":"Specialty Manufacturing and Construction Supply Business","s":"UT","y":2025,"r":4174370,"e":504841,"m":2.67},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"WI","y":2025,"r":2594777,"e":534449,"m":3.3},{"n":237310,"d":"Asphalt Paving and Blacktop Business","s":"OH","y":2025,"r":617000,"e":165000,"m":2.12},{"n":238220,"d":"Fire Suppression Systems Company","s":"CA","y":2025,"r":714598,"e":245179,"m":2.04},{"n":238170,"d":"Siding Contractor","s":"","y":2025,"r":315744,"e":49224,"m":5.08},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2025,"r":3954848,"e":650259,"m":1.0},{"n":238110,"d":"Foundation Contractor","s":"UT","y":2025,"r":1187236,"e":447056,"m":1.79},{"n":238210,"d":"Electrical Contractor","s":"NC","y":2025,"r":637042,"e":169028,"m":2.96},{"n":238210,"d":"Residential and Commercial Electrical Services Franchise (Home-Based Business)","s":"NH","y":2025,"r":1124028,"e":196825,"m":2.79},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (80% Residential, 20% Commerci","s":"FL","y":2025,"r":459060,"e":106463,"m":1.97},{"n":541320,"d":"Provides Custom Landscape Design, Installation, and Maintenance Services","s":"CA","y":2025,"r":2288622,"e":146352,"m":3.76},{"n":561730,"d":"Residential and Commercial Lawn Care and Landscaping Business","s":"FL","y":2025,"r":984468,"e":387919,"m":1.16},{"n":561730,"d":"Residential Lawn Care and Landscaping Business","s":"FL","y":2025,"r":169011,"e":110777,"m":1.58},{"n":238220,"d":"Residential and Commercial Heating, Ventilation, and Air Conditioning (HVAC) Com","s":"ON","y":2025,"r":2000000,"e":270000,"m":1.67},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"MO","y":2025,"r":4179504,"e":551664,"m":2.36},{"n":337110,"d":"Custom Home Cabinet Contractor","s":"FL","y":2025,"r":325005,"e":69821,"m":3.22},{"n":238350,"d":"Window and Door Installation Company","s":"WA","y":2025,"r":708223,"e":301096,"m":2.09},{"n":238990,"d":"Swimming Pool Builder and Remodeler (80% Residential, 20% Commercial)","s":"FL","y":2025,"r":5202413,"e":633475,"m":3.05},{"n":238220,"d":"Residential and Commercial Heating, Ventilation, and Air Conditioning (HVAC) and","s":"VA","y":2025,"r":1200000,"e":297000,"m":2.69},{"n":237310,"d":"Asphalt Paving and Maintenance","s":"AZ","y":2025,"r":27798737,"e":3267596,"m":3.83},{"n":238160,"d":"Commercial Roofing Contractor","s":"FL","y":2025,"r":3236921,"e":452177,"m":1.99},{"n":238310,"d":"Ceiling Contractor","s":"CA","y":2025,"r":4297419,"e":792025,"m":3.03},{"n":238390,"d":"Custom Window Treatment Contractor","s":"FL","y":2025,"r":494586,"e":164199,"m":0.91},{"n":561730,"d":"Landscaping Services","s":"MI","y":2025,"r":2024016,"e":476982,"m":1.99},{"n":561730,"d":"Commercial Lawn Maintenance, Landscape Design, and Installation","s":"FL","y":2025,"r":909766,"e":246716,"m":1.62},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (80% Residential, 20% Commerci","s":"FL","y":2025,"r":3919930,"e":86070,"m":8.13},{"n":236115,"d":"Custom Home Builder","s":"IL","y":2025,"r":75000000,"e":875000,"m":1.94},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"TX","y":2025,"r":2580000,"e":265000,"m":3.09},{"n":541330,"d":"Engineering Construction Company","s":"FL","y":2025,"r":2529669,"e":584825,"m":3.21},{"n":238310,"d":"Construction Firm Providing Specialty Insulation Applications","s":"TX","y":2025,"r":520000,"e":141625,"m":2.12},{"n":238990,"d":"Gutter Installation Business","s":"MN","y":2025,"r":921537,"e":428296,"m":2.52},{"n":238220,"d":"Commercial Plumbing and Heating, Ventilation, and Air Conditioning (HVAC) Compan","s":"PA","y":2025,"r":8304000,"e":564000,"m":3.1},{"n":238990,"d":"Fencing Company","s":"TX","y":2025,"r":1303769,"e":465169,"m":1.72},{"n":238990,"d":"New Pool Construction and Pool Remodeling","s":"TX","y":2025,"r":596742,"e":88240,"m":3.4},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (90% Residential, 10% Commerci","s":"FL","y":2025,"r":1619449,"e":205230,"m":3.65},{"n":238220,"d":"Sprinkler Repair and Handyman Business","s":"FL","y":2025,"r":192649,"e":124398,"m":1.05},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (Home-Based Business)","s":"FL","y":2025,"r":398462,"e":153309,"m":1.63},{"n":115116,"d":"Agriculture Contractor","s":"VA","y":2025,"r":2000000,"e":625000,"m":3.2},{"n":238350,"d":"Services and Installs Garage Doors","s":"FL","y":2025,"r":1280000,"e":467000,"m":1.07},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"AZ","y":2025,"r":191560,"e":81000,"m":0.25},{"n":238990,"d":"Specialty Installation Firm Offering White-Glove Delivery and Precision Placemen","s":"TX","y":2025,"r":563081,"e":247098,"m":3.22},{"n":561730,"d":"Commercial Landscaping, Lawn Maintenance, and Tree Service","s":"FL","y":2025,"r":894879,"e":476033,"m":2.63},{"n":238990,"d":"Miscellaneous Services","s":"FL","y":2025,"r":4374769,"e":629225,"m":1.91},{"n":238210,"d":"Commercial and Residential Electrical Contractor","s":"WA","y":2025,"r":701886,"e":150000,"m":2.63},{"n":238320,"d":"Painting Contractor","s":"FL","y":2025,"r":850418,"e":174112,"m":1.22},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2025,"r":2998902,"e":303074,"m":2.64},{"n":561730,"d":"Professional Landscaping and Outdoor Design Services","s":"CA","y":2025,"r":646583,"e":83842,"m":2.98},{"n":561730,"d":"Landscaping and Lawn Services","s":"MN","y":2025,"r":2204464,"e":527296,"m":3.78},{"n":238220,"d":"Plumbing Business","s":"FL","y":2025,"r":1650727,"e":715465,"m":4.33},{"n":238220,"d":"Patio Misting System Installation Company","s":"CO","y":2025,"r":233079,"e":73536,"m":2.04},{"n":238220,"d":"Residential Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2025,"r":1920719,"e":661124,"m":3.63},{"n":238350,"d":"Residential Garage Door Business (Home-Based Business)","s":"TX","y":2025,"r":608203,"e":190686,"m":2.23},{"n":238990,"d":"Commercial and Institutional Pool Construction and Water Treatment","s":"NJ","y":2025,"r":8000000,"e":954884,"m":3.95},{"n":236118,"d":"Residential Kitchen and Bathroom Products Sales, Design, and Remodeling Services","s":"FL","y":2025,"r":2325000,"e":556560,"m":2.25},{"n":236118,"d":"Home Improvement Contractor","s":"CO","y":2025,"r":1872195,"e":402590,"m":2.24},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) and Plumbing Contractor","s":"MN","y":2025,"r":682384,"e":93264,"m":2.68},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"KY","y":2025,"r":441420,"e":126288,"m":1.07},{"n":238990,"d":"Pool Company (Sales and Construction)","s":"AR","y":2025,"r":1756910,"e":336091,"m":1.93},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2025,"r":18042966,"e":3331074,"m":1.83},{"n":238220,"d":"Irrigation, Landscaping, and Lawn Service Business","s":"FL","y":2025,"r":933454,"e":204069,"m":1.47},{"n":238350,"d":"Closet Install Business","s":"IA","y":2025,"r":807601,"e":392119,"m":0.98},{"n":238220,"d":"Irrigation, Landscaping, and Lawn Service Business","s":"FL","y":2025,"r":955614,"e":159617,"m":1.88},{"n":238210,"d":"Electrical Contractor","s":"NH","y":2025,"r":6561851,"e":1899539,"m":1.9},{"n":561730,"d":"Residential Lawn Care and Landscaping Business","s":"FL","y":2025,"r":112146,"e":65327,"m":1.45},{"n":238210,"d":"Electrical and General Contracting Business","s":"NH","y":2025,"r":8196512,"e":1695980,"m":2.12},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (40% Commercial, 60% Industria","s":"FL","y":2025,"r":1944088,"e":437542,"m":1.6},{"n":238910,"d":"Excavating and Trucking Company","s":"CO","y":2025,"r":2573580,"e":1078878,"m":3.24},{"n":238210,"d":"Commercial and Residential Electrical Contractor","s":"WA","y":2025,"r":1094744,"e":129462,"m":4.25},{"n":561730,"d":"Commercial and Residential Landscaping Company","s":"TX","y":2025,"r":2207036,"e":348877,"m":3.73},{"n":337110,"d":"Cabinetry Manufacturing and Remodeling Business","s":"CO","y":2025,"r":1956327,"e":829071,"m":1.45},{"n":238290,"d":"Repairs Sliding Glass Door Issues including Rollers, Handles, Locks, Tracks,  an","s":"FL","y":2025,"r":332076,"e":102206,"m":0.78},{"n":561730,"d":"Residential Lawn Care and Landscaping Business","s":"FL","y":2025,"r":203747,"e":79847,"m":1.34},{"n":561730,"d":"Residential Lawn Maintenance and Landscaping Business (Home-Based Business)","s":"FL","y":2025,"r":203447,"e":79547,"m":1.35},{"n":238210,"d":"Electrical Contractor (95% Residential, 5% Commercial)","s":"FL","y":2025,"r":576546,"e":181731,"m":0.82},{"n":238210,"d":"Low Voltage Cabling and Telecommunications Contractor","s":"PA","y":2025,"r":20066000,"e":2731000,"m":2.45},{"n":337110,"d":"Residential and Commercial Custom Cabinet Contractor","s":"FL","y":2025,"r":1076996,"e":315116,"m":1.59},{"n":238330,"d":"Flooring Business","s":"GA","y":2025,"r":1714014,"e":724332,"m":2.97},{"n":561730,"d":"Landscape Maintenance Business","s":"CO","y":2025,"r":1471825,"e":190473,"m":2.36},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (80% Residential, 20% Commerci","s":"FL","y":2025,"r":2117952,"e":928734,"m":4.09},{"n":238150,"d":"Glass and Glazing Contractor","s":"FL","y":2025,"r":9226332,"e":1517367,"m":2.9},{"n":237990,"d":"Dock and Lift Contracting Business, Specializing in the Construction and Repair ","s":"FL","y":2025,"r":1247126,"e":293263,"m":1.88},{"n":238320,"d":"Residential and Commercial Painting Contractor","s":"TX","y":2025,"r":532068,"e":84727,"m":2.6},{"n":238220,"d":"Plumbing Business","s":"WA","y":2025,"r":1601040,"e":360600,"m":2.8},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Business (Home-Based Business)","s":"CO","y":2025,"r":1573643,"e":503870,"m":1.19},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (90% Residential, 10% Commerci","s":"FL","y":2025,"r":1106070,"e":490292,"m":2.45},{"n":238210,"d":"Residential and Commercial Electrical Contractor","s":"FL","y":2025,"r":1558473,"e":467550,"m":3.53},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"IL","y":2025,"r":1616460,"e":395242,"m":3.3},{"n":238220,"d":"Plumbing Business","s":"FL","y":2025,"r":224528,"e":76146,"m":0.98},{"n":238310,"d":"Indoor Plastering Company","s":"CA","y":2025,"r":3820000,"e":640000,"m":2.81},{"n":423720,"d":"Heating, Ventilation, and Air Conditioning, Electrical, and Plumbing Supply Dist","s":"FL","y":2025,"r":1550790,"e":391487,"m":3.2},{"n":236118,"d":"Provides Construction, Janitorial, and Building Maintenance Services","s":"CA","y":2025,"r":2995476,"e":424307,"m":4.24},{"n":238220,"d":"Commercial Heating, Ventilation, and Air Conditioning (HVAC) Installation, Servi","s":"CA","y":2025,"r":5920771,"e":229319,"m":4.36},{"n":238220,"d":"Water Filtration Service Business (Home-Based Business)","s":"AZ","y":2025,"r":371888,"e":194006,"m":1.34},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Company","s":"OR","y":2025,"r":9392000,"e":1261422,"m":4.33},{"n":236220,"d":"Construction Management and Owner's Representative Service Business","s":"FL","y":2025,"r":1208608,"e":567611,"m":2.64},{"n":238910,"d":"Commercial Site Contractor","s":"FL","y":2025,"r":20264679,"e":3088850,"m":5.83},{"n":238220,"d":"Plumbing Business","s":"FL","y":2025,"r":447992,"e":181499,"m":0.83},{"n":236220,"d":"Construction Company","s":"MD","y":2025,"r":3590262,"e":428412,"m":3.38},{"n":238210,"d":"Cabling Business","s":"CO","y":2025,"r":1522014,"e":772710,"m":2.33},{"n":561730,"d":"Commercial and Residential Lawn Care and Landscaping Company","s":"FL","y":2025,"r":588898,"e":356512,"m":1.29},{"n":238990,"d":"Paving Sealcoating and Striping Company","s":"CA","y":2025,"r":4700000,"e":860000,"m":2.91},{"n":237310,"d":"Asphalt and Paving Contractor","s":"CA","y":2025,"r":5560000,"e":920000,"m":2.39},{"n":238190,"d":"Aluminum Screens, Carports, and Rescreening Company","s":"FL","y":2025,"r":1275253,"e":336990,"m":3.56},{"n":561790,"d":"Pool Renovation and Repair Business","s":"FL","y":2025,"r":3956048,"e":700510,"m":2.57},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Company (Home-Based Business)","s":"AZ","y":2025,"r":287111,"e":119588,"m":1.33},{"n":238220,"d":"Residential and Commercial Heating, Ventilation, and Air Conditioning (HVAC) Bus","s":"TX","y":2025,"r":455337,"e":68902,"m":2.54},{"n":236118,"d":"Full Service Kitchen and Bathroom Remodeling Company","s":"CO","y":2025,"r":768937,"e":228134,"m":1.1},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) and Plumbing Company","s":"IN","y":2025,"r":4483172,"e":1413993,"m":3.54},{"n":236118,"d":"Kitchen and Bathroom Remodeling and Design Company","s":"NM","y":2025,"r":828909,"e":108787,"m":2.6},{"n":324121,"d":"Asphalt Manufacturer and Paving and Excavation Company","s":"PA","y":2025,"r":10779000,"e":1300000,"m":3.27},{"n":238320,"d":"Painting Contractor","s":"FL","y":2025,"r":18000000,"e":4600000,"m":2.07},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2025,"r":425486,"e":96257,"m":2.34},{"n":238210,"d":"Solar Panel Sales and Installation Company","s":"IL","y":2025,"r":2302647,"e":323093,"m":2.17},{"n":238220,"d":"Commercial Plumbing Business (Home-Based Business)","s":"MA","y":2025,"r":1039259,"e":603932,"m":1.66},{"n":236220,"d":"Commercial Building Remodeler","s":"FL","y":2025,"r":1528630,"e":203870,"m":2.45},{"n":238210,"d":"Electrical Contractor","s":"CA","y":2025,"r":3179735,"e":631303,"m":2.31},{"n":238150,"d":"Commercial and Residential Glass Business","s":"TX","y":2025,"r":583196,"e":71311,"m":2.1},{"n":236118,"d":"Home Remodeler","s":"OH","y":2025,"r":5865548,"e":1652477,"m":2.27},{"n":238990,"d":"New Pool Construction and Hot Tub Sales","s":"MN","y":2025,"r":9310817,"e":1012573,"m":2.67},{"n":238160,"d":"Full-Service Commercial Roofing Contractor","s":"CO","y":2025,"r":2471149,"e":419858,"m":1.8},{"n":236118,"d":"General Contractor","s":"FL","y":2025,"r":1969245,"e":607109,"m":1.71},{"n":236118,"d":"Retail, Wholesale, Design, and Installation for Bath and Kitchen Remodels","s":"FL","y":2025,"r":2462793,"e":445339,"m":1.91},{"n":238220,"d":"Plumbing and Heating, Ventilation, and Air Conditioning (HVAC) Company","s":"PA","y":2025,"r":727359,"e":140650,"m":2.81},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (87% Residential, 13% Commerci","s":"FL","y":2025,"r":1122002,"e":248729,"m":3.22},{"n":238330,"d":"Flooring and Cabinet Business","s":"FL","y":2025,"r":1985662,"e":290464,"m":1.64},{"n":238220,"d":"Residential Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2025,"r":962222,"e":177352,"m":1.55},{"n":238990,"d":"Decorative Metal Fencing Fabrication and Installation Company","s":"FL","y":2025,"r":2011127,"e":174517,"m":2.89},{"n":238190,"d":"Aluminum Enclosures Contractor","s":"FL","y":2025,"r":2797150,"e":302928,"m":2.84},{"n":238220,"d":"Commercial Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2025,"r":3726580,"e":990555,"m":3.41},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (Commercial 20%, Re","s":"IA","y":2025,"r":1776394,"e":239632,"m":3.34},{"n":238330,"d":"Reseller and Installer of Marine Flooring Products (Home-Based Business)","s":"WA","y":2025,"r":679587,"e":521909,"m":1.92},{"n":449129,"d":"Art Framing Company","s":"CA","y":2025,"r":1967443,"e":430133,"m":3.02},{"n":238210,"d":"Provides Low-Voltage Solutions to the Telephony and Wireless Industry (Home-Base","s":"CA","y":2025,"r":994826,"e":263760,"m":2.46},{"n":238160,"d":"Gutters Contractor","s":"FL","y":2025,"r":2202463,"e":252751,"m":2.77},{"n":561730,"d":"Residential Lawn Care and Landscaping Business","s":"FL","y":2025,"r":365085,"e":85027,"m":2.06},{"n":238210,"d":"Electrical Contractor Working with Marine Contractors, Pools and Spas, and Servi","s":"FL","y":2025,"r":2212562,"e":850721,"m":2.11},{"n":561730,"d":"Residential Lawn Care and Landscaping Business","s":"FL","y":2025,"r":228000,"e":99120,"m":2.07},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2025,"r":3733492,"e":154492,"m":1.62},{"n":238220,"d":"Plumbing Service and Drain Service Company","s":"OH","y":2025,"r":5268838,"e":634916,"m":4.04},{"n":238150,"d":"Glass Company","s":"SC","y":2025,"r":601225,"e":300225,"m":2.02},{"n":423730,"d":"Export Distributor of Heating, Ventilation, and Air Conditioning (HVAC), Plumbin","s":"FL","y":2025,"r":1270448,"e":279564,"m":2.32},{"n":423730,"d":"Distributor of Heating, Ventilation, and Air Conditioning (HVAC), Plumbing, Pool","s":"FL","y":2025,"r":1061976,"e":290990,"m":2.23},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (Home-Based Busines","s":"MN","y":2025,"r":839439,"e":368541,"m":1.49},{"n":238220,"d":"Residential and Commercial Heating, Ventilation, and Air Conditioning (HVAC) Bus","s":"AL","y":2025,"r":5536055,"e":392002,"m":5.1},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Cleaning and Restoration Busin","s":"NY","y":2025,"r":1925526,"e":197189,"m":2.23},{"n":237990,"d":"Construction Service and Installation Contractor","s":"CO","y":2025,"r":8424456,"e":317937,"m":5.01},{"n":238220,"d":"Plumbing Contractor","s":"NC","y":2025,"r":4651996,"e":803656,"m":2.36},{"n":238290,"d":"Fiberglass Pool Installation Company","s":"FL","y":2025,"r":2954104,"e":633435,"m":1.58},{"n":238210,"d":"Residential and Commercial Electrical Contractor","s":"FL","y":2025,"r":1737829,"e":982444,"m":2.44},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (97% Residential, 3% Commercia","s":"FL","y":2025,"r":1943808,"e":577952,"m":4.24},{"n":561730,"d":"Landscaping and Sprinkler Repair Business (Home-Based Business)","s":"CA","y":2025,"r":1278650,"e":491257,"m":2.95},{"n":237110,"d":"Well Drilling and Services Contractor","s":"FL","y":2025,"r":5230653,"e":1460824,"m":2.7},{"n":237310,"d":"Asphalt Paving and Grading Services","s":"AZ","y":2025,"r":8600000,"e":1700000,"m":3.18},{"n":238990,"d":"Contract Installation Business","s":"WI","y":2025,"r":315080,"e":233934,"m":2.0},{"n":561730,"d":"Commercial Landscaping Company","s":"FL","y":2025,"r":655516,"e":154408,"m":2.91},{"n":238910,"d":"Specialized Drilling Services and Solar Foundation Installation Company","s":"CA","y":2025,"r":46204522,"e":4609267,"m":4.34},{"n":238220,"d":"Commercial HVAC Service Business","s":"TX","y":2024,"r":7569342,"e":2057745,"m":3.09},{"n":213112,"d":"Provides Pipeline and Construction, Work Over Rig, Crane, and Roustabout Service","s":"CO","y":2024,"r":34584450,"e":3155703,"m":3.64},{"n":238160,"d":"Commercial Roofing Business","s":"OK","y":2024,"r":4500000,"e":350000,"m":1.43},{"n":238220,"d":"Residential Plumbing Company","s":"","y":2024,"r":398587,"e":163970,"m":1.83},{"n":238220,"d":"HVAC Company (60% Residential, 40% Commercial)","s":"FL","y":2024,"r":1436669,"e":70613,"m":4.67},{"n":238110,"d":"Concrete Forming, Placing, and Finishing Contracting Company (Home-Based Busines","s":"TX","y":2024,"r":1267401,"e":531181,"m":1.79},{"n":238210,"d":"Solar Installation Company","s":"ID","y":2024,"r":2272561,"e":369865,"m":2.43},{"n":561730,"d":"Residential and Commercial Landscape Service Company","s":"ID","y":2024,"r":7943960,"e":2700515,"m":3.52},{"n":238320,"d":"Painting and Commercial Carpentry Company","s":"","y":2024,"r":6624560,"e":1599677,"m":5.0},{"n":236118,"d":"Home Remodel Contractor","s":"FL","y":2024,"r":963523,"e":333642,"m":1.48},{"n":238990,"d":"Pool Contractor","s":"FL","y":2024,"r":10823986,"e":686073,"m":6.56},{"n":444110,"d":"Lumber and Building Supply Store","s":"SD","y":2024,"r":8205032,"e":926035,"m":4.29},{"n":238160,"d":"Residential Roofing Contractor","s":"FL","y":2024,"r":2567057,"e":596018,"m":0.92},{"n":236118,"d":"Kitchen and Bath Remodeler","s":"FL","y":2024,"r":5438773,"e":1576499,"m":3.68},{"n":237990,"d":"Heavy Engineering Construction Company","s":"","y":2024,"r":6851295,"e":429208,"m":2.79},{"n":238160,"d":"Roofing Contractor (Home-Based Business)","s":"NC","y":2024,"r":1335269,"e":322680,"m":1.7},{"n":236118,"d":"Residential Remodeling Business","s":"CT","y":2024,"r":1449344,"e":246100,"m":1.63},{"n":238220,"d":"HVAC and Plumbing Company","s":"FL","y":2024,"r":1623830,"e":490231,"m":2.04},{"n":236118,"d":"Closet Contractor","s":"FL","y":2024,"r":1965705,"e":357823,"m":2.1},{"n":238220,"d":"Plumbing Contractor","s":"AZ","y":2024,"r":16246523,"e":3053849,"m":3.93},{"n":238220,"d":"HVAC Company","s":"FL","y":2024,"r":678042,"e":296822,"m":1.18},{"n":238220,"d":"Commercial and Residential Plumbing Company","s":"TX","y":2024,"r":852548,"e":248047,"m":2.02},{"n":236118,"d":"Remodeling, Design and Flooring Business","s":"CA","y":2024,"r":9500000,"e":1000000,"m":2.03},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (99% Residential, 1% Commercia","s":"FL","y":2024,"r":990523,"e":267183,"m":2.43},{"n":238220,"d":"Residential Plumbing Company","s":"FL","y":2024,"r":1091262,"e":403775,"m":1.61},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (95% Residential, 5% Commercia","s":"FL","y":2024,"r":1650378,"e":320951,"m":5.61},{"n":238210,"d":"Heating, Ventilation, and Air Conditioning (HVAC) and Mechanical Contractor (50%","s":"BC","y":2024,"r":3436000,"e":534404,"m":1.22},{"n":561730,"d":"Residential Landscape Business","s":"FL","y":2024,"r":149491,"e":38299,"m":2.61},{"n":561730,"d":"Commercial Lawn Care and Landscape Company","s":"FL","y":2024,"r":3585266,"e":375074,"m":5.07},{"n":238990,"d":"Restoration Contractor","s":"MN","y":2024,"r":5874540,"e":659922,"m":9.85},{"n":561790,"d":"Pool and Spa Maintenance, Service and Renovation Company","s":"FL","y":2024,"r":4365315,"e":458505,"m":2.29},{"n":238210,"d":"Commercial Electrical Contractor","s":"NV","y":2024,"r":1076554,"e":355525,"m":1.97},{"n":238160,"d":"Roofing and Coating Company","s":"FL","y":2024,"r":3696241,"e":585761,"m":2.39},{"n":238990,"d":"Asphalt and Sealcoating Company","s":"FL","y":2024,"r":827452,"e":233401,"m":1.71},{"n":238340,"d":"Grout and Tile Restoration Company","s":"FL","y":2024,"r":310361,"e":131460,"m":1.71},{"n":236220,"d":"Building Contractor","s":"OH","y":2024,"r":3600536,"e":438700,"m":2.17},{"n":238220,"d":"Commercial and Residential HVAC and Refrigeration Company","s":"FL","y":2024,"r":6706120,"e":912943,"m":3.07},{"n":236220,"d":"Custom Lean-To and A-Frame Style Shed and Barn Builder","s":"UT","y":2024,"r":865574,"e":323603,"m":1.85},{"n":332322,"d":"Sheet Metal Fabrication Business","s":"IL","y":2024,"r":2009655,"e":611456,"m":3.43},{"n":327991,"d":"Granite Counter Top Business Contractor","s":"TX","y":2024,"r":1001222,"e":327216,"m":3.36},{"n":238220,"d":"HVAC Company (90% Residential, 10% Commercial)","s":"FL","y":2024,"r":303976,"e":7345,"m":14.98},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"FL","y":2024,"r":1024827,"e":137596,"m":2.54},{"n":236118,"d":"Provides Handyman and Irrigation Services to Property Management Firms","s":"FL","y":2024,"r":874524,"e":187912,"m":0.96},{"n":541330,"d":"Mechanical Engineering Company with Heating, Ventilation, and Air Conditioning (","s":"CA","y":2024,"r":1088967,"e":433906,"m":2.22},{"n":238990,"d":"Fence Installation Business","s":"ID","y":2024,"r":1758123,"e":260214,"m":2.23},{"n":238330,"d":"Flooring Company Sales  and Installation Franchise","s":"AL","y":2024,"r":1800878,"e":231500,"m":1.92},{"n":238220,"d":"Commercial Refrigeration, HVAC, and Appliance Installation and Repair Service","s":"NC","y":2024,"r":1520650,"e":334750,"m":1.79},{"n":238290,"d":"Residential and Commercial Overhead Garage Door Installation, Repair and Mainten","s":"FL","y":2024,"r":551429,"e":124803,"m":2.4},{"n":238990,"d":"Construction Cleanup Business","s":"FL","y":2024,"r":1177491,"e":365518,"m":3.56},{"n":238320,"d":"Residential Painting and Drywall Company","s":"TX","y":2024,"r":1375948,"e":218738,"m":2.74},{"n":238220,"d":"Residential HVAC and Refrigeration Company","s":"FL","y":2024,"r":4163091,"e":793539,"m":5.04},{"n":238990,"d":"Fence Contractor (75% Residential, 25% Commercial)","s":"FL","y":2024,"r":2093044,"e":687220,"m":2.76},{"n":238220,"d":"Residential and Commercial Irrigation and Sprinkler Company","s":"FL","y":2024,"r":332440,"e":55639,"m":1.8},{"n":238140,"d":"Concrete Floor Remodeling","s":"MN","y":2024,"r":1059049,"e":172258,"m":3.13},{"n":238220,"d":"Plumbing Business","s":"MD","y":2024,"r":6145910,"e":1034735,"m":3.09},{"n":238220,"d":"Dry and Wet Utilities Contractor","s":"AZ","y":2024,"r":5857613,"e":886960,"m":2.25},{"n":238220,"d":"Residential HVAC Company","s":"FL","y":2024,"r":868613,"e":91868,"m":4.35},{"n":238990,"d":"Designs and Builds Custom Concrete Pools and Spas (80% Residential, 20% Commerci","s":"FL","y":2024,"r":2699901,"e":302583,"m":2.15},{"n":238220,"d":"HVAC Company","s":"FL","y":2024,"r":268580,"e":90358,"m":1.66},{"n":238110,"d":"Concrete Contractor(Home-Based Business)","s":"MN","y":2024,"r":369938,"e":212948,"m":1.76},{"n":238210,"d":"Residential and Commercial Electrical Contractor (Home-Based Business)","s":"NC","y":2024,"r":196092,"e":89921,"m":1.69},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2024,"r":6871129,"e":925674,"m":2.92},{"n":238220,"d":"HVAC Company (Home-Based Business)","s":"FL","y":2024,"r":3056440,"e":1477049,"m":4.4},{"n":238320,"d":"Painting Contractor","s":"IL","y":2024,"r":403417,"e":193485,"m":1.49},{"n":238310,"d":"Kitchen Cabinet Manufacturing","s":"FL","y":2024,"r":842923,"e":467751,"m":1.2},{"n":238210,"d":"Commercial Electrical Contractor","s":"AL","y":2024,"r":3420000,"e":440000,"m":3.78},{"n":238160,"d":"Roofing Contractor ( 85% Residential, 15% Commercial)","s":"FL","y":2024,"r":9396981,"e":1734963,"m":3.75},{"n":238220,"d":"HVAC Contractor","s":"MN","y":2024,"r":423295,"e":139855,"m":1.29},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2024,"r":734721,"e":121378,"m":2.06},{"n":238990,"d":"Paver Installation Company","s":"FL","y":2024,"r":2427406,"e":526680,"m":2.66},{"n":238310,"d":"Commercial Spray Fireproofing and Insulation Business","s":"PA","y":2024,"r":1093299,"e":213129,"m":2.35},{"n":238290,"d":"Residential and Commercial Garage Door Business","s":"MN","y":2024,"r":952882,"e":184784,"m":2.14},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (90% Residential, 10% Commerci","s":"FL","y":2024,"r":1417122,"e":311658,"m":3.85},{"n":238210,"d":"Electrical Contractor","s":"MA","y":2024,"r":1386703,"e":385633,"m":2.66},{"n":238990,"d":"Custom Swimming Pool Builder","s":"FL","y":2024,"r":6239625,"e":1052333,"m":2.84},{"n":238310,"d":"Spray Foam Insulation Company","s":"OH","y":2024,"r":1438986,"e":373682,"m":2.72},{"n":561920,"d":"Special Event and Trade Show General Service Contractor","s":"CA","y":2024,"r":2109071,"e":435820,"m":2.06},{"n":238990,"d":"Residential and Commercial Fence Contractror","s":"FL","y":2024,"r":8638186,"e":1376231,"m":3.33},{"n":562910,"d":"Water Damage Restoration and Reconstruction Company Franchise","s":"CO","y":2024,"r":1322883,"e":185658,"m":3.23},{"n":238210,"d":"Holiday and Landscape Lighting Installation Company","s":"FL","y":2024,"r":2376093,"e":429194,"m":3.06},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2024,"r":1050040,"e":115840,"m":1.73},{"n":238310,"d":"Custom Cabinet Manufacturing","s":"FL","y":2024,"r":323001,"e":115740,"m":1.21},{"n":238220,"d":"Residential and Commercial Irrigation and Sprinkler Company","s":"FL","y":2024,"r":1175289,"e":301426,"m":2.07},{"n":238160,"d":"Commercial and Industrial Roofing Company","s":"OH","y":2024,"r":2123619,"e":463241,"m":1.68},{"n":238160,"d":"Commercial Roofing Contractor","s":"BC","y":2024,"r":5595877,"e":1084727,"m":1.61},{"n":327999,"d":"Landscape and Soil Materials Manufacturer","s":"CA","y":2024,"r":2715137,"e":554707,"m":2.7},{"n":238330,"d":"Residential Hardwood and Tile Flooring Company","s":"","y":2024,"r":17780466,"e":1622687,"m":1.85},{"n":236118,"d":"Kitchen and Bath Remodeling Business","s":"NC","y":2024,"r":887565,"e":170064,"m":1.85},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"FL","y":2024,"r":1875687,"e":292601,"m":3.93},{"n":238310,"d":"HVAC, Mechanical, and Plumbing Pipe Insulation Company","s":"FL","y":2024,"r":2380544,"e":271396,"m":3.68},{"n":238220,"d":"Residential Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2024,"r":2891369,"e":368740,"m":4.47},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"TX","y":2024,"r":271000,"e":156000,"m":2.56},{"n":238130,"d":"Custom Framing, Display and Preservation Business","s":"TX","y":2024,"r":1250000,"e":300000,"m":2.67},{"n":811122,"d":"Glass Contractor","s":"NV","y":2024,"r":1000000,"e":300000,"m":3.17},{"n":238310,"d":"Custom Cabinet Manufacturing","s":"FL","y":2024,"r":3193165,"e":571121,"m":2.63},{"n":238310,"d":"Drywall Contractor (Home-Based Business)","s":"MT","y":2024,"r":892000,"e":525000,"m":1.87},{"n":238990,"d":"Screen Enclosure Business","s":"FL","y":2024,"r":4930110,"e":827198,"m":2.54},{"n":238990,"d":"Radon Mitigation Business","s":"CO","y":2024,"r":348423,"e":145215,"m":1.71},{"n":238220,"d":"Commercial and Residential Plumbing Company","s":"FL","y":2024,"r":637956,"e":196608,"m":1.65},{"n":238210,"d":"Telecommunications Cabling and Installation Company","s":"SC","y":2024,"r":4392825,"e":1263905,"m":3.72},{"n":561730,"d":"Landscaping Services Business (Home-Based Business)","s":"TX","y":2024,"r":514000,"e":160000,"m":2.5},{"n":238310,"d":"Kitchen Cabinet Manufacturing (90% Residential, 10% Commercial)","s":"FL","y":2024,"r":1862270,"e":298629,"m":1.81},{"n":236118,"d":"Building Renovation and Repair Business Franchise","s":"AL","y":2024,"r":344825,"e":90761,"m":2.97},{"n":238170,"d":"Gutter Installation and Repair","s":"FL","y":2024,"r":619044,"e":111812,"m":2.46},{"n":561730,"d":"Landscaping Services Contractor","s":"TX","y":2024,"r":513552,"e":160052,"m":2.34},{"n":561790,"d":"Pool Service, Repair, and Renovation Company","s":"MD","y":2024,"r":2970000,"e":489500,"m":2.04},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC)","s":"MI","y":2024,"r":13126729,"e":891275,"m":13.46},{"n":238210,"d":"Electrical Contractor (Home-Based Business)","s":"CO","y":2024,"r":1310567,"e":33281,"m":9.89},{"n":444180,"d":"Lumber Yard and Retail Hardware","s":"MD","y":2024,"r":5016332,"e":478027,"m":3.14},{"n":238210,"d":"Electrical Contractor (Home-Based Business)","s":"TX","y":2024,"r":1136743,"e":293158,"m":1.65},{"n":238220,"d":"HVAC Company","s":"FL","y":2024,"r":307984,"e":100859,"m":0.63},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (75% Residential an","s":"IL","y":2024,"r":2159739,"e":255265,"m":2.74},{"n":238210,"d":"Low Voltage Cable Installation Company","s":"FL","y":2024,"r":1542596,"e":330724,"m":2.72},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (60% Residential, 40% Commerci","s":"FL","y":2024,"r":2289440,"e":397790,"m":5.53},{"n":238220,"d":"Mechanical Contractor Business of Plumbing and Site Utilities","s":"LA","y":2024,"r":2861568,"e":595220,"m":1.18},{"n":238320,"d":"Painting Contractor Franchise (Home-Based Business)","s":"CO","y":2024,"r":552133,"e":161989,"m":1.23},{"n":561730,"d":"Landscape Service","s":"OR","y":2024,"r":5672689,"e":1453544,"m":4.13},{"n":561730,"d":"Commercial Landscaping Business","s":"FL","y":2024,"r":1349121,"e":185710,"m":3.76},{"n":238210,"d":"Commercial and Residential Electrical Service","s":"AB","y":2024,"r":1130328,"e":98459,"m":3.0},{"n":237990,"d":"Construction of Docks, Boardwalks, Boat Lifts, Boat Houses, and Wood Seawalls","s":"FL","y":2024,"r":549284,"e":134352,"m":2.42},{"n":238220,"d":"Commercial Plumbing Business","s":"FL","y":2024,"r":1942016,"e":314872,"m":3.73},{"n":238150,"d":"Window Film Installation Company (Home-Based Business)","s":"MN","y":2024,"r":104371,"e":68149,"m":2.2},{"n":238220,"d":"Residential and Commercial Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2024,"r":2914972,"e":498850,"m":5.01},{"n":238210,"d":"Electrical Contractor and Security Monitoring Installation Company","s":"FL","y":2024,"r":293561,"e":168761,"m":0.89},{"n":238220,"d":"Design, Installation and Servicing of Heating, Ventilation, and Air Conditioning","s":"NH","y":2024,"r":54558022,"e":5016577,"m":2.99},{"n":238220,"d":"Commercial HVAC, Electrical, Plumbing Business","s":"NC","y":2024,"r":1636611,"e":447111,"m":3.58},{"n":238160,"d":"Residential and Commercial Roofing Contractor","s":"FL","y":2024,"r":1635747,"e":227273,"m":3.08},{"n":238110,"d":"Residential and Commercial Foundation Contractor Franchise","s":"KY","y":2024,"r":3530566,"e":620004,"m":1.21},{"n":238220,"d":"Specialty Heating, Ventilation, and Air Conditioning (HVAC) and Refrigeration Co","s":"FL","y":2024,"r":730981,"e":226517,"m":1.1},{"n":423310,"d":"Lumber Distributor","s":"KY","y":2024,"r":23057869,"e":1633554,"m":4.04},{"n":561730,"d":"Residential Lawn and Landscape Business","s":"FL","y":2024,"r":224838,"e":134665,"m":1.0},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (40% Residential, 60% Commerci","s":"FL","y":2024,"r":1468321,"e":420636,"m":3.33},{"n":238310,"d":"Custom Cabinet Manufacturing","s":"FL","y":2024,"r":266402,"e":121850,"m":1.23},{"n":236118,"d":"Home Remodeling","s":"MN","y":2024,"r":972388,"e":269416,"m":2.04},{"n":238110,"d":"Decorative Concrete Contractor","s":"MN","y":2024,"r":2400578,"e":852698,"m":3.05},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2024,"r":2012863,"e":215439,"m":2.09},{"n":238220,"d":"HVAC Business","s":"TX","y":2024,"r":1200000,"e":325000,"m":2.15},{"n":561730,"d":"Commercial Lawn Care, Landscaping, and Tree Trimming and Removal","s":"FL","y":2024,"r":388840,"e":194155,"m":2.19},{"n":238220,"d":"Plumbing Company","s":"FL","y":2024,"r":706106,"e":139914,"m":1.43},{"n":236118,"d":"Residential Remodelers","s":"CA","y":2024,"r":683335,"e":301237,"m":1.24},{"n":238330,"d":"Flooring Installation Business","s":"CO","y":2024,"r":976698,"e":180656,"m":2.21},{"n":238160,"d":"Residential Roofing Contractor","s":"ID","y":2024,"r":1744885,"e":422157,"m":1.9},{"n":541320,"d":"Landscape Design and Build Company","s":"NJ","y":2024,"r":12598368,"e":3344651,"m":4.04},{"n":238170,"d":"Stucco Contractor","s":"FL","y":2024,"r":811527,"e":416032,"m":1.92},{"n":238320,"d":"Commercial Painting Company","s":"SD","y":2024,"r":769166,"e":205073,"m":2.68},{"n":238110,"d":"Concrete Contractor","s":"FL","y":2024,"r":469744,"e":243392,"m":0.29},{"n":444240,"d":"Nursery and Commercial Landscape Company","s":"LA","y":2024,"r":1225000,"e":206000,"m":2.31},{"n":238290,"d":"Fire Protection Equipment Installation","s":"CT","y":2024,"r":1887869,"e":821372,"m":7.3},{"n":238150,"d":"Residential and Commercial Window Tinting Business","s":"FL","y":2024,"r":163193,"e":67392,"m":1.63},{"n":238220,"d":"Heating and Air Conditioning Installation","s":"NC","y":2024,"r":3036861,"e":247443,"m":3.44},{"n":238310,"d":"Custom Cabinet Manufacturing","s":"FL","y":2024,"r":3780279,"e":471888,"m":3.43},{"n":238330,"d":"Flooring Business","s":"CO","y":2024,"r":2096653,"e":253179,"m":2.63},{"n":238220,"d":"Commercial HVACR Business","s":"IA","y":2024,"r":842834,"e":61519,"m":3.84},{"n":238220,"d":"Plumbing and Heating Contractor","s":"MN","y":2024,"r":507603,"e":79153,"m":1.45},{"n":238220,"d":"Residential and Commercial Plumbing, Heating, Ventilation, and Air Conditioning ","s":"MI","y":2024,"r":5318479,"e":1996494,"m":2.5},{"n":238990,"d":"Custom Pool Screen Enclosures Business","s":"FL","y":2024,"r":842670,"e":171404,"m":1.84},{"n":236220,"d":"Building and Remodeling Company (Home-Based Business)","s":"MN","y":2024,"r":529028,"e":265936,"m":1.24},{"n":238990,"d":"Sealcoating and Parking Lot Striping Business","s":"TN","y":2024,"r":580544,"e":245299,"m":2.75},{"n":238390,"d":"Window Coverings Contractor","s":"CA","y":2024,"r":404118,"e":124089,"m":1.33},{"n":238160,"d":"Exterior Contractor (Home-Based Business)","s":"MN","y":2024,"r":1334975,"e":672296,"m":2.05},{"n":561730,"d":"Landscaping and Lawn Care Business","s":"FL","y":2024,"r":329714,"e":182295,"m":1.26},{"n":238220,"d":"Residential HVAC (70%) and Plumbing (30%) Service","s":"CA","y":2024,"r":854374,"e":230690,"m":2.82},{"n":238310,"d":"Drywall Subcontractor","s":"WA","y":2024,"r":6508006,"e":1845000,"m":3.41},{"n":238220,"d":"Michigan Irrigation Contractor","s":"MI","y":2024,"r":4359253,"e":1471377,"m":2.89},{"n":332311,"d":"Metal Building Contractor","s":"TX","y":2024,"r":5584286,"e":537527,"m":5.33},{"n":332323,"d":"Ornamental Metalwork Contractor","s":"FL","y":2024,"r":2236160,"e":784713,"m":2.01},{"n":561730,"d":"Commercial and Residential Landscaping Business","s":"NJ","y":2024,"r":606104,"e":129602,"m":2.7},{"n":238220,"d":"Commercial and Residential Plumbing and Heating Services","s":"WA","y":2024,"r":5758142,"e":730975,"m":3.31},{"n":444180,"d":"Lumber Yard","s":"ND","y":2024,"r":6815682,"e":910848,"m":2.87},{"n":238990,"d":"Fence Contractor","s":"FL","y":2024,"r":1713352,"e":273529,"m":1.46},{"n":561730,"d":"Retail Construction, Landscaping, and Erosion Materials Business","s":"VA","y":2024,"r":3992885,"e":899307,"m":3.74},{"n":238210,"d":"Electrical  Contractor","s":"PA","y":2024,"r":2390894,"e":314414,"m":2.39},{"n":561730,"d":"Residential Landscaping Business","s":"MT","y":2024,"r":2359169,"e":615950,"m":2.63},{"n":236118,"d":"Handyman Business","s":"TX","y":2024,"r":1061992,"e":126823,"m":2.56},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"TX","y":2024,"r":1055568,"e":320705,"m":3.04},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Business","s":"OH","y":2024,"r":981459,"e":349373,"m":3.15},{"n":238310,"d":"Spray Foam Insulation Contractor (Home-Based Business)","s":"MI","y":2024,"r":866988,"e":435051,"m":2.07},{"n":237990,"d":"Residential and Commercial Construction and Repair of Marine Docks, Boat Lifts, ","s":"FL","y":2024,"r":2558703,"e":488825,"m":1.89},{"n":444180,"d":"Lumber Yard","s":"VT","y":2024,"r":10981221,"e":1380382,"m":2.54},{"n":238320,"d":"Painting Contractor (Commercial 85%, Residential 15%)","s":"SC","y":2024,"r":3350797,"e":600000,"m":2.08},{"n":238160,"d":"Roofing Company (Home-Based Business)","s":"GA","y":2024,"r":2361727,"e":375296,"m":2.66},{"n":238990,"d":"Specialty Trades Contractor","s":"AB","y":2024,"r":1421563,"e":304651,"m":2.46},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (80% Residential, 20% Commerci","s":"FL","y":2024,"r":1467112,"e":223907,"m":4.47},{"n":327390,"d":"Concrete Manufacturer","s":"TX","y":2024,"r":843700,"e":216063,"m":3.01},{"n":238330,"d":"Commercial Flooring Business","s":"CO","y":2024,"r":1429857,"e":180157,"m":2.55},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":628542,"e":309467,"m":1.29},{"n":238310,"d":"Commercial Insulation Contractor","s":"UT","y":2024,"r":2196152,"e":763790,"m":2.75},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":1086043,"e":209627,"m":1.29},{"n":561730,"d":"Landscape Company","s":"MD","y":2024,"r":484402,"e":136187,"m":1.84},{"n":561730,"d":"Commercial Landscaping and Yard Services (Home-Based Business)","s":"FL","y":2024,"r":487846,"e":137855,"m":2.54},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":382816,"e":118156,"m":1.99},{"n":238310,"d":"Commercial and Industrial Insulation Contractor","s":"AL","y":2024,"r":4211574,"e":849743,"m":3.24},{"n":238150,"d":"Glass and Glazing Contractor","s":"FL","y":2024,"r":1508513,"e":116785,"m":3.77},{"n":561730,"d":"Hardscape, Landscape and Tree Services","s":"NC","y":2024,"r":909515,"e":305403,"m":1.95},{"n":236118,"d":"Handyman Service","s":"OH","y":2024,"r":261031,"e":50258,"m":1.19},{"n":561730,"d":"Landscaping and Concrete Business (Home-Based Business)","s":"CO","y":2024,"r":2836142,"e":766056,"m":2.87},{"n":442210,"d":"Flooring Contractor","s":"NY","y":2024,"r":1604545,"e":230423,"m":1.36},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":90000,"e":54300,"m":1.2},{"n":238990,"d":"Commercial Fence Design And Installation","s":"KY","y":2024,"r":5184279,"e":1348815,"m":2.41},{"n":238150,"d":"Business-to-Business Supplier and Installer of Windows and Bath Products","s":"CA","y":2024,"r":20048158,"e":2895348,"m":1.73},{"n":238160,"d":"Residential Roofing Services (Home-Based Business)","s":"AB","y":2024,"r":2879059,"e":536416,"m":1.61},{"n":238350,"d":"Home Renovation Interior Door Business","s":"GA","y":2024,"r":1872885,"e":406923,"m":1.47},{"n":238320,"d":"Residential and Commercial Painting Company","s":"FL","y":2024,"r":272702,"e":204527,"m":0.39},{"n":238110,"d":"Decorative Concrete Business Franchise","s":"CO","y":2024,"r":1367985,"e":493041,"m":3.65},{"n":236118,"d":"Residential Remodeling and Property Renovation Business (Home-Based Business)","s":"GA","y":2024,"r":6490003,"e":1572137,"m":2.54},{"n":238320,"d":"Painting and Wall Covering Contractor","s":"FL","y":2024,"r":1812643,"e":339609,"m":2.12},{"n":238220,"d":"HVAC Contractor","s":"FL","y":2024,"r":1844612,"e":360990,"m":1.94},{"n":238210,"d":"Electrical Contractor","s":"MN","y":2024,"r":1303765,"e":220662,"m":1.74},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":201851,"e":99933,"m":1.35},{"n":238220,"d":"HVAC Contractor Franchise","s":"ID","y":2024,"r":1442998,"e":322865,"m":2.79},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2024,"r":1265887,"e":149643,"m":2.17},{"n":236118,"d":"Kitchen and Bath Remodeling Contractor","s":"CA","y":2024,"r":3701657,"e":617868,"m":1.86},{"n":238990,"d":"Specialty Trade Contractor","s":"FL","y":2024,"r":1037029,"e":210082,"m":3.09},{"n":561730,"d":"Landscaping Business","s":"FL","y":2024,"r":961592,"e":489733,"m":3.37},{"n":238220,"d":"Plumbing Company","s":"FL","y":2024,"r":2241587,"e":235777,"m":1.06},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":1844612,"e":360990,"m":1.94},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (99% Residential, 1% Commercia","s":"FL","y":2024,"r":941520,"e":201102,"m":3.53},{"n":333415,"d":"Commercial Comfort Heating and Cooling Manufacturing (Home-Based Business)","s":"WI","y":2024,"r":1485114,"e":235933,"m":0.42},{"n":238990,"d":"Screening Contractor (Home-Based Business)","s":"FL","y":2024,"r":2585750,"e":897078,"m":2.9},{"n":238220,"d":"HVAC Business","s":"NC","y":2024,"r":1371792,"e":306361,"m":1.63},{"n":238150,"d":"Glass and Glazing Contractor","s":"FL","y":2024,"r":658000,"e":146000,"m":0.81},{"n":325510,"d":"Concrete Coating Contractor","s":"UT","y":2024,"r":3050582,"e":413216,"m":3.75},{"n":238320,"d":"Painting and Construction Remodeler","s":"VA","y":2024,"r":288090,"e":80000,"m":1.61},{"n":238220,"d":"Backflow Prevention and Testing Company (Home-Based Business)","s":"MD","y":2024,"r":1209113,"e":539579,"m":2.69},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":820990,"e":74398,"m":4.03},{"n":238210,"d":"Electrical Contractor","s":"TX","y":2024,"r":3320931,"e":735259,"m":2.72},{"n":238990,"d":"Overhead Doors Contractor","s":"MN","y":2024,"r":655381,"e":525608,"m":0.06},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":1467047,"e":324953,"m":2.0},{"n":327390,"d":"Manufacturer of Precast Concrete Products","s":"","y":2024,"r":1980663,"e":419813,"m":2.56},{"n":238320,"d":"Painting Contractor","s":"CO","y":2024,"r":888384,"e":94597,"m":1.73},{"n":238170,"d":"Gutter Contractor","s":"FL","y":2024,"r":991308,"e":254104,"m":2.25},{"n":238350,"d":"Cabinet Refinishing Franchise","s":"FL","y":2024,"r":1456480,"e":421860,"m":0.02},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":1561831,"e":570565,"m":2.97},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"PA","y":2024,"r":647325,"e":213838,"m":1.4},{"n":238350,"d":"Window Replacement Company (Home-Based Business)","s":"NJ","y":2024,"r":1617376,"e":307000,"m":2.61},{"n":236118,"d":"Bathroom and Kitchen Remodeling Business","s":"NY","y":2024,"r":7215050,"e":1194367,"m":1.67},{"n":238220,"d":"Home-Based Heating, Ventilation, and Air Conditioning (HVAC) Contractor (40% res","s":"PA","y":2024,"r":914843,"e":396551,"m":1.26},{"n":238220,"d":"Plumbing and Heating Business","s":"MA","y":2024,"r":2319495,"e":913491,"m":3.16},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2024,"r":3284505,"e":507187,"m":3.15},{"n":561730,"d":"Landscaping Business","s":"OR","y":2024,"r":659668,"e":159776,"m":2.6},{"n":238220,"d":"Distributors and Installers of Commercial Heating and Control Systems","s":"PA","y":2024,"r":2800617,"e":243313,"m":3.58},{"n":238210,"d":"Low Voltage Electrical Contractor","s":"NJ","y":2024,"r":35399388,"e":9078014,"m":5.61},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":601693,"e":151695,"m":1.19},{"n":541320,"d":"Landscaping Business","s":"OR","y":2024,"r":1008293,"e":309052,"m":2.35},{"n":236118,"d":"Home Improvement Contractor","s":"NC","y":2024,"r":855170,"e":85002,"m":0.88},{"n":561730,"d":"Landscaping Business","s":"CO","y":2024,"r":3027420,"e":913776,"m":2.63},{"n":238160,"d":"Residential and Commercial Roofing Contractor","s":"FL","y":2024,"r":18719000,"e":4084000,"m":3.67},{"n":238350,"d":"Finish Carpentry Contractor","s":"FL","y":2024,"r":1136167,"e":346268,"m":2.09},{"n":562910,"d":"Insurance Restoration Contractor","s":"VA","y":2024,"r":1444399,"e":468767,"m":2.99},{"n":236118,"d":"Fire, Flood and Biohazard Restoration Company Franchise","s":"CO","y":2024,"r":1248465,"e":255488,"m":1.96},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":5161608,"e":625403,"m":2.88},{"n":238320,"d":"Painting and Wall Covering Contractor","s":"FL","y":2024,"r":809968,"e":121791,"m":1.52},{"n":238330,"d":"Flooring Contractor","s":"FL","y":2024,"r":969973,"e":254988,"m":0.84},{"n":238330,"d":"Flooring Sales and Installation","s":"WI","y":2024,"r":3454288,"e":346191,"m":2.98},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":141660,"e":107100,"m":0.75},{"n":236118,"d":"Remodeling Contractor (Home-Based Business)","s":"MN","y":2024,"r":542690,"e":131737,"m":3.8},{"n":561730,"d":"Landscape, Rockscape and High-Quality Deck-Building Business (Home-Based Busines","s":"CO","y":2024,"r":673904,"e":414149,"m":2.36},{"n":238990,"d":"Specialty Trade Contractor","s":"FL","y":2024,"r":361606,"e":197881,"m":1.21},{"n":236118,"d":"Home Improvement Contractor","s":"VA","y":2024,"r":2192614,"e":745398,"m":1.61},{"n":561730,"d":"Home Landscape Lighting and Irrigation Business","s":"SC","y":2024,"r":711772,"e":368919,"m":2.98},{"n":238210,"d":"Electrical Contractor Business","s":"NS","y":2024,"r":1929291,"e":324741,"m":1.35},{"n":236118,"d":"Remodeling and Home Building Design Contracting Company","s":"","y":2024,"r":4179720,"e":1835136,"m":2.94},{"n":444240,"d":"Retail and Wholesale Landscaping Products such as Trees, Shrubs, and Flowers","s":"TX","y":2024,"r":2037582,"e":642170,"m":1.17},{"n":236118,"d":"Home Improvement Renovation Franchise","s":"MD","y":2024,"r":496000,"e":46000,"m":0.03},{"n":532412,"d":"Construction Equipment Rental Business","s":"TX","y":2024,"r":2822704,"e":690000,"m":1.21},{"n":238990,"d":"Specialty Trade Contractor","s":"FL","y":2024,"r":1942738,"e":563301,"m":2.66},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2024,"r":314987,"e":18371,"m":6.53},{"n":238210,"d":"Residential and Commercial Electrical Contractor","s":"PA","y":2024,"r":560996,"e":182189,"m":1.45},{"n":238110,"d":"Concrete Contractor","s":"SD","y":2024,"r":3679496,"e":1002904,"m":0.8},{"n":238160,"d":"Roofing Contractor","s":"AZ","y":2024,"r":684826,"e":211954,"m":1.71},{"n":238210,"d":"Electrical Contractor","s":"TX","y":2024,"r":601443,"e":70005,"m":1.57},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"NC","y":2024,"r":736629,"e":200104,"m":1.02},{"n":238990,"d":"Parking Lot Maintenance Contractor","s":"SC","y":2024,"r":875735,"e":274972,"m":3.23},{"n":238320,"d":"Painting and Wall Covering Contractor","s":"FL","y":2024,"r":1771429,"e":648959,"m":1.7},{"n":237990,"d":"Civil Engineering Construction","s":"FL","y":2024,"r":5687761,"e":516279,"m":4.46},{"n":238160,"d":"Roofing Business","s":"CO","y":2024,"r":1322128,"e":488432,"m":0.98},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2024,"r":43893839,"e":8899489,"m":3.03},{"n":237310,"d":"Guardrail and Commercial Fencing Contractor","s":"AK","y":2024,"r":5729430,"e":741578,"m":3.38},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2024,"r":2533320,"e":130120,"m":2.92},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":607234,"e":157797,"m":1.9},{"n":238150,"d":"Glass and Glazing Contractor","s":"FL","y":2024,"r":5457950,"e":1161825,"m":3.62},{"n":236118,"d":"Home Improvement Contractor","s":"PA","y":2024,"r":2432088,"e":382351,"m":3.38},{"n":561730,"d":"Landscape Lighting Business","s":"FL","y":2024,"r":480502,"e":208522,"m":1.92},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":1533837,"e":291713,"m":4.11},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":507424,"e":176629,"m":0.37},{"n":238190,"d":"Awning Business (Home-Based Business)","s":"CO","y":2024,"r":867533,"e":168153,"m":0.89},{"n":238220,"d":"Mechanical Contracting Company","s":"FL","y":2024,"r":6838214,"e":1274719,"m":2.94},{"n":561730,"d":"Landscaping and Yard Business","s":"FL","y":2024,"r":550050,"e":163921,"m":1.53},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":1691972,"e":477598,"m":1.84},{"n":238990,"d":"Specialty Trade Contractor","s":"FL","y":2024,"r":579175,"e":219739,"m":2.39},{"n":561730,"d":"Landscaping Business","s":"AZ","y":2024,"r":1477496,"e":197000,"m":1.19},{"n":238320,"d":"Painting Contractor","s":"NC","y":2024,"r":2863067,"e":491065,"m":1.55},{"n":238220,"d":"Heating and Air Conditioning Business","s":"SC","y":2024,"r":2624761,"e":548728,"m":2.73},{"n":238220,"d":"Commercial Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"WI","y":2024,"r":2086882,"e":460356,"m":2.28},{"n":238330,"d":"Floor Design and Installation Contractor","s":"CO","y":2024,"r":7540703,"e":1461711,"m":2.74},{"n":423840,"d":"Construction Supply Distributor","s":"MN","y":2024,"r":1256897,"e":227348,"m":2.51},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":2535362,"e":778273,"m":1.8},{"n":449129,"d":"Custom Picture Framing Business","s":"TX","y":2024,"r":597705,"e":307919,"m":2.09},{"n":238150,"d":"Glass Installation and Mirror Business","s":"MI","y":2024,"r":1037173,"e":250332,"m":2.88},{"n":238110,"d":"Residential and Commercial Concrete Services","s":"CO","y":2024,"r":1911211,"e":236950,"m":1.47},{"n":442210,"d":"Flooring Contractor","s":"PA","y":2024,"r":1391675,"e":229326,"m":1.55},{"n":423310,"d":"Woodworking and Lumber Company","s":"WA","y":2024,"r":893660,"e":195833,"m":1.0},{"n":238160,"d":"Roofing Company","s":"FL","y":2024,"r":44666688,"e":11603455,"m":2.32},{"n":238140,"d":"Masonry Maintenance and Restoration Business","s":"OH","y":2024,"r":1625129,"e":582501,"m":2.06},{"n":238220,"d":"Plumbing Service","s":"CA","y":2024,"r":1931552,"e":163456,"m":3.13},{"n":238220,"d":"Residential Plumbing Company","s":"FL","y":2024,"r":1749426,"e":481111,"m":3.95},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"","y":2024,"r":1445518,"e":205513,"m":2.81},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":200903,"e":4337,"m":16.14},{"n":238220,"d":"Residential Heating, Ventilation, and Cooling (HVAC) and Plumbing Business (40% ","s":"FL","y":2024,"r":5099982,"e":2173724,"m":2.99},{"n":236118,"d":"Remodeling Business (Home-Based Business)","s":"MN","y":2024,"r":1358401,"e":196769,"m":1.54},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":2093314,"e":348771,"m":2.58},{"n":238320,"d":"Painting Contractor","s":"TX","y":2024,"r":797396,"e":154482,"m":1.76},{"n":541320,"d":"Design and Installation Landscaping Company","s":"CO","y":2024,"r":2476926,"e":483331,"m":3.31},{"n":238150,"d":"Glass Installation Company","s":"WY","y":2024,"r":1800000,"e":200000,"m":4.9},{"n":236220,"d":"Commercial Construction","s":"VA","y":2024,"r":3847776,"e":619945,"m":2.32},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2024,"r":689320,"e":112001,"m":2.68},{"n":238990,"d":"Installs Mailboxes for Residences and Commercial Businesses","s":"MO","y":2024,"r":346780,"e":74715,"m":1.47},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":1017153,"e":650237,"m":2.37},{"n":236115,"d":"Construction and Remodel Business","s":"OR","y":2024,"r":6707859,"e":625636,"m":2.73},{"n":238190,"d":"Home Exteriors Business","s":"NC","y":2024,"r":1533093,"e":345853,"m":2.31},{"n":561720,"d":"Janitorial, Landscape and Other Maintenance services","s":"CA","y":2024,"r":329470,"e":139607,"m":2.51},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":487069,"e":89365,"m":3.02},{"n":332322,"d":"Sheet Metal Fabricator","s":"WA","y":2024,"r":123269,"e":70100,"m":0.7},{"n":238190,"d":"Construction Welding Contractor","s":"WA","y":2024,"r":2336485,"e":980501,"m":1.84},{"n":238320,"d":"Painting and Wall Covering Contractor","s":"FL","y":2024,"r":979852,"e":235883,"m":0.85},{"n":238220,"d":"Residential Heating, Ventilation, and Cooling (HVAC) and Plumbing Business","s":"FL","y":2024,"r":5077598,"e":1232247,"m":4.06},{"n":561730,"d":"Landscaping Business","s":"NY","y":2024,"r":541886,"e":135201,"m":2.19},{"n":541330,"d":"Construction Engineering Service","s":"AB","y":2024,"r":680896,"e":135423,"m":1.11},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":72378,"e":37891,"m":1.78},{"n":561730,"d":"Landscaping Business","s":"SC","y":2024,"r":257739,"e":132028,"m":1.86},{"n":327991,"d":"Countertop Contractor","s":"FL","y":2024,"r":396351,"e":73429,"m":1.69},{"n":238220,"d":"Commercial Heating, Ventilation, and Air Conditioning (HVAC) Installation Compan","s":"CO","y":2024,"r":7735359,"e":1954643,"m":3.68},{"n":238210,"d":"Commercial Electrical Contractor","s":"TX","y":2024,"r":11207674,"e":1212058,"m":7.43},{"n":238350,"d":"Cabinet Contractor","s":"OK","y":2024,"r":630000,"e":225000,"m":0.67},{"n":238990,"d":"Specialty Trades Contractor","s":"AB","y":2024,"r":1776363,"e":504197,"m":1.64},{"n":238390,"d":"Commercial Waterproofing Company (Home-Based Business)","s":"","y":2024,"r":1037027,"e":327891,"m":1.22},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":4358456,"e":385099,"m":2.6},{"n":238120,"d":"Structural Steel and Precast Concrete Contractor","s":"FL","y":2024,"r":7694473,"e":1417871,"m":2.54},{"n":238210,"d":"Industrial and Commercial Electrical Contractor","s":"OK","y":2024,"r":20052145,"e":693052,"m":11.76},{"n":238210,"d":"Residential and Commercial Electrical Contractor","s":"CA","y":2024,"r":804420,"e":229820,"m":1.96},{"n":238110,"d":"Concrete Construction Contractor","s":"PA","y":2024,"r":674492,"e":295095,"m":1.69},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":197767,"e":67427,"m":1.28},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":338086,"e":131162,"m":1.98},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"TX","y":2024,"r":1324896,"e":259463,"m":2.27},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":994311,"e":547193,"m":1.71},{"n":236118,"d":"Home Improvement Contractor","s":"NC","y":2024,"r":661598,"e":12912,"m":11.62},{"n":236115,"d":"Custom Home Building Company","s":"CO","y":2024,"r":22582659,"e":3364852,"m":2.94},{"n":238210,"d":"Fully Automated Smart Home","s":"MN","y":2024,"r":2137227,"e":442288,"m":3.17},{"n":238220,"d":"Plumbing Company (Home-Based Business)","s":"QC","y":2024,"r":727452,"e":182472,"m":0.93},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":119440,"e":21528,"m":2.09},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"PA","y":2024,"r":402223,"e":277801,"m":3.42},{"n":238220,"d":"HVAC and Mechanical Contractor (Home-Based Business)","s":"WA","y":2024,"r":1197117,"e":214429,"m":3.5},{"n":238350,"d":"Finish Carpentry Contractor","s":"FL","y":2024,"r":1414445,"e":321605,"m":1.87},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":1717568,"e":474655,"m":2.95},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":856615,"e":92244,"m":3.79},{"n":238910,"d":"Excavation Company","s":"TX","y":2024,"r":1681533,"e":312385,"m":3.2},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":1380403,"e":158880,"m":1.57},{"n":238220,"d":"Plumbing Contractor","s":"PA","y":2024,"r":927331,"e":370781,"m":2.43},{"n":238350,"d":"Garage Door Contractor (Home-Based Business)","s":"CO","y":2024,"r":358000,"e":125000,"m":1.54},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":567832,"e":143388,"m":1.85},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"TX","y":2024,"r":5168296,"e":1086711,"m":5.06},{"n":238990,"d":"Fence Installation Contractor","s":"NE","y":2024,"r":4030385,"e":710921,"m":3.52},{"n":541320,"d":"Landscaping Business","s":"UT","y":2024,"r":6074644,"e":977951,"m":2.92},{"n":423310,"d":"Lumber, Plywood, Millwork, and Wood Panel Merchant Wholesaler","s":"FL","y":2024,"r":20287783,"e":3789191,"m":2.92},{"n":236118,"d":"Home Improvement Contractor","s":"SD","y":2024,"r":35000000,"e":3850000,"m":3.77},{"n":238340,"d":"Marble and Granite Retailer","s":"AL","y":2024,"r":987673,"e":206442,"m":2.79},{"n":238140,"d":"Residential and Commercial Foundation Repair Business","s":"OH","y":2024,"r":1444601,"e":453498,"m":3.81},{"n":238210,"d":"Commercial Electrical Contractor","s":"GA","y":2024,"r":1003389,"e":356891,"m":1.34},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":22800,"e":20000,"m":1.6},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":1499868,"e":559700,"m":2.14},{"n":238350,"d":"Custom Closet Contractor","s":"FL","y":2024,"r":3193765,"e":939840,"m":2.66},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":2682083,"e":634801,"m":1.33},{"n":238350,"d":"Fabrication and Installation of Granite Countertops","s":"UT","y":2024,"r":1161151,"e":211762,"m":2.67},{"n":238290,"d":"Sells and Installs Dust Collection and Paint Booth Equipment","s":"WA","y":2024,"r":1203930,"e":203427,"m":4.5},{"n":238210,"d":"Electrical and Solar Business","s":"CA","y":2024,"r":1133558,"e":269000,"m":1.12},{"n":238220,"d":"Residential Heating, Ventilation, and Cooling (HVAC) Business","s":"FL","y":2024,"r":1614342,"e":601817,"m":3.32},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":5093499,"e":1379948,"m":5.98},{"n":238110,"d":"Poured Concrete Foundation and Structure Contractor","s":"FL","y":2024,"r":4254597,"e":1253199,"m":2.27},{"n":238330,"d":"Flooring Contractor","s":"FL","y":2024,"r":889125,"e":478452,"m":4.39},{"n":561730,"d":"Boutique Landscaping Business","s":"CO","y":2024,"r":257724,"e":109215,"m":1.64},{"n":236118,"d":"Residential Renovation Business (Home-Based Business)","s":"GA","y":2024,"r":2100000,"e":469000,"m":1.67},{"n":561730,"d":"Landscape Business","s":"CO","y":2024,"r":2115068,"e":554660,"m":2.84},{"n":238170,"d":"Seamless Gutter Company (Home-Based Business)","s":"TX","y":2024,"r":589000,"e":220000,"m":2.05},{"n":238210,"d":"Commercial and Residential Electrical Contractor","s":"MD","y":2024,"r":854000,"e":175000,"m":1.77},{"n":236220,"d":"Commercial Building General Contractor","s":"NC","y":2024,"r":794169,"e":407911,"m":1.47},{"n":238990,"d":"Specialty Trade Contractor","s":"FL","y":2024,"r":3094270,"e":188640,"m":4.24},{"n":444110,"d":"Lumber Yard and Construction Supplies Distributor","s":"KY","y":2024,"r":5958000,"e":772000,"m":3.24},{"n":238210,"d":"Residential and Commercial Electrical Contractor","s":"CO","y":2024,"r":630357,"e":197370,"m":0.76},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":609281,"e":159723,"m":2.5},{"n":561730,"d":"Landscape Company","s":"TX","y":2024,"r":456655,"e":134717,"m":2.0},{"n":561730,"d":"Landscape Maintenance Company","s":"CA","y":2024,"r":9700085,"e":1038611,"m":3.85},{"n":238140,"d":"Masonry Contractor","s":"","y":2024,"r":1971789,"e":242763,"m":4.09},{"n":561730,"d":"Tree, Concrete and Landscaping Services","s":"MO","y":2024,"r":2287328,"e":547966,"m":2.06},{"n":238990,"d":"Specialty Trade Contractor","s":"FL","y":2024,"r":9991553,"e":905398,"m":4.42},{"n":238150,"d":"Window, Siding and Roofing Company","s":"NH","y":2024,"r":460335,"e":22904,"m":2.62},{"n":561730,"d":"Landscaping Business","s":"NJ","y":2024,"r":436690,"e":201830,"m":1.19},{"n":561730,"d":"Residential and Commercial Landscape Design and Maintenance","s":"OR","y":2024,"r":215757,"e":51594,"m":4.03},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"NJ","y":2024,"r":2281779,"e":355267,"m":3.95},{"n":236115,"d":"General Contractor","s":"","y":2024,"r":35278000,"e":2327000,"m":2.58},{"n":238350,"d":"Cabinet Refinishing Business","s":"NC","y":2024,"r":216126,"e":120000,"m":1.33},{"n":236118,"d":"Home Improvement Contractor","s":"NC","y":2024,"r":1380028,"e":213911,"m":2.52},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":194441,"e":101702,"m":1.23},{"n":236118,"d":"Kitchen, Bath and Home Remodel Business","s":"CO","y":2024,"r":1467667,"e":109113,"m":3.67},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":367640,"e":169042,"m":1.95},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":10695012,"e":799915,"m":6.63},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":3983204,"e":725369,"m":5.51},{"n":238150,"d":"Designs and Manufactures Frameless Shower Doors and Mirrors","s":"FL","y":2024,"r":1455107,"e":244938,"m":2.45},{"n":238350,"d":"Finish Carpentry Contractor","s":"FL","y":2024,"r":2473823,"e":215398,"m":1.85},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":843867,"e":169398,"m":1.06},{"n":561730,"d":"Irrigation and Landscaping Business","s":"TX","y":2024,"r":116988,"e":68469,"m":1.24},{"n":236115,"d":"","s":"FL","y":2024,"r":14104549,"e":3015039,"m":1.82},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2024,"r":1595555,"e":286215,"m":2.27},{"n":238110,"d":"Asphalt and Concrete Repair Services","s":"TX","y":2024,"r":2940100,"e":405455,"m":4.93},{"n":236118,"d":"Home Improvement Contractor","s":"CO","y":2024,"r":2274236,"e":271466,"m":1.01},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":401053,"e":112234,"m":1.96},{"n":238110,"d":"Concrete Repair Company","s":"CO","y":2024,"r":201230,"e":44547,"m":2.24},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":2252606,"e":408990,"m":2.2},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (10% Residential, 90% Commerci","s":"FL","y":2024,"r":3144486,"e":589087,"m":5.43},{"n":561730,"d":"Landscaping Service","s":"FL","y":2024,"r":436971,"e":73727,"m":4.07},{"n":238990,"d":"Restoration Company","s":"PA","y":2024,"r":2156678,"e":952406,"m":0.74},{"n":236118,"d":"Residential Exterior Contractor (Home-Based Business)","s":"MN","y":2024,"r":5595009,"e":1116258,"m":3.05},{"n":238220,"d":"A/C and Heating Contractor","s":"UT","y":2024,"r":3102299,"e":316067,"m":0.95},{"n":238210,"d":"Electrical Contractor","s":"TX","y":2024,"r":1282776,"e":220760,"m":3.62},{"n":238170,"d":"Gutters Contractor","s":"OH","y":2024,"r":904518,"e":241718,"m":3.16},{"n":238220,"d":"A/C and Heating Contractor","s":"CA","y":2024,"r":2065913,"e":717414,"m":2.5},{"n":236118,"d":"Home Improvement Contractor Franchise","s":"SC","y":2024,"r":2926719,"e":755366,"m":2.98},{"n":238220,"d":"A/C, Heating and Plumbing Contractor","s":"NJ","y":2024,"r":290923,"e":46017,"m":2.17},{"n":238160,"d":"Roofing Contractor","s":"MT","y":2024,"r":1443558,"e":590666,"m":0.93},{"n":238220,"d":"A/C and Heating Contractor","s":"OH","y":2024,"r":2644556,"e":366276,"m":3.11},{"n":238990,"d":"Specialty Trades Contractor","s":"TX","y":2024,"r":710221,"e":150124,"m":2.33},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2024,"r":2075650,"e":597969,"m":1.99},{"n":238140,"d":"Masonry Contractor","s":"ID","y":2024,"r":2046215,"e":562075,"m":2.98},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2024,"r":923965,"e":229901,"m":1.96},{"n":238320,"d":"Painting Contractor","s":"AR","y":2024,"r":1117231,"e":201452,"m":1.99},{"n":561730,"d":"Landscaping Business","s":"ID","y":2024,"r":975867,"e":272673,"m":2.38},{"n":238330,"d":"Flooring Contractor","s":"MD","y":2024,"r":3090973,"e":247230,"m":2.22},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2024,"r":61409300,"e":10791474,"m":8.34},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2024,"r":329501,"e":80956,"m":1.73},{"n":238160,"d":"Roofing and Siding Contractor","s":"NJ","y":2024,"r":3620316,"e":569401,"m":1.23},{"n":327331,"d":"Manufactures and Installs Precast Concrete Products","s":"","y":2024,"r":14250677,"e":2703975,"m":3.88},{"n":238220,"d":"A/C and Heating Contractor","s":"MO","y":2024,"r":3245859,"e":321104,"m":0.78},{"n":541320,"d":"Landscape Design Business","s":"NJ","y":2024,"r":745691,"e":214334,"m":2.33},{"n":238160,"d":"Roofing Contractor","s":"TX","y":2024,"r":30469801,"e":6113856,"m":6.64},{"n":236220,"d":"Construction General Contractor","s":"MO","y":2024,"r":18930363,"e":2267125,"m":2.21},{"n":561621,"d":"Sales, Installation, Repair and Monitoring Services of Fire Protection Equipment","s":"VA","y":2024,"r":1941019,"e":434273,"m":4.95},{"n":238330,"d":"Flooring Contractor","s":"VA","y":2024,"r":1060959,"e":99973,"m":2.1},{"n":238160,"d":"Roofing Contractor","s":"","y":2024,"r":3233974,"e":589132,"m":2.46},{"n":238220,"d":"Air Conditioning and Heating Services (90% Residential and 10% Commercial)","s":"FL","y":2024,"r":1005948,"e":181958,"m":1.18},{"n":238290,"d":"Garage Door Maintenance and Service Company","s":"FL","y":2024,"r":43092,"e":19699,"m":3.3},{"n":238320,"d":"Commercial Painting","s":"MN","y":2024,"r":3175608,"e":620216,"m":2.82},{"n":238290,"d":"Installation of Refrigeration Systems for Commercial Customers","s":"","y":2024,"r":9988000,"e":2369000,"m":8.61},{"n":238320,"d":"Painting Company","s":"SD","y":2024,"r":421065,"e":132371,"m":1.89},{"n":561730,"d":"Residential Lawn Maintenance and Landscaping Business (Home-Based Business)","s":"FL","y":2024,"r":391317,"e":98145,"m":1.34},{"n":333120,"d":"Manufacturer of Construction Equipment","s":"","y":2023,"r":11798000,"e":2633000,"m":4.37},{"n":332322,"d":"Sheet Metal Fabrication and Machine Shop","s":"CA","y":2023,"r":11722741,"e":1547278,"m":2.49},{"n":238220,"d":"Residential Heating, Ventilation, and Air Conditioning (HVAC), and Plumbing Cont","s":"OH","y":2023,"r":1133829,"e":278895,"m":2.15},{"n":238190,"d":"Awning Company","s":"CO","y":2023,"r":926906,"e":143661,"m":1.91},{"n":561730,"d":"Landscaping Service","s":"FL","y":2023,"r":475381,"e":177536,"m":1.69},{"n":561730,"d":"Landscaping Service","s":"FL","y":2023,"r":401758,"e":118688,"m":2.16},{"n":238210,"d":"Electrical Construction Company","s":"NC","y":2023,"r":5494656,"e":725000,"m":6.21},{"n":238290,"d":"Garage Organization Business Franchise","s":"FL","y":2023,"r":1951216,"e":379142,"m":2.27},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2023,"r":34617095,"e":6863573,"m":5.1},{"n":238150,"d":"Windows and Doors Contractor","s":"FL","y":2023,"r":1907307,"e":532633,"m":0.94},{"n":238210,"d":"Electrical Pool Contractor","s":"FL","y":2023,"r":2632075,"e":572037,"m":3.5},{"n":561730,"d":"Residential Landscaping Business","s":"PA","y":2023,"r":522162,"e":242405,"m":1.36},{"n":238220,"d":"Industrial and Residential HVAC Business","s":"WI","y":2023,"r":551623,"e":74946,"m":2.44},{"n":238190,"d":"Commercial Welding and Fabrication Contractor","s":"CT","y":2023,"r":3455270,"e":597164,"m":3.35},{"n":561730,"d":"Landscaping and Lawn Maintenance Business","s":"FL","y":2023,"r":495399,"e":130665,"m":1.91},{"n":238990,"d":"Pool Safety Fence Sales and Installation","s":"FL","y":2023,"r":1076882,"e":527361,"m":3.1},{"n":238220,"d":"Air Conditioning, Heating and Ventilation Service Company","s":"FL","y":2023,"r":770000,"e":223083,"m":1.73},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2023,"r":1443859,"e":158041,"m":2.53},{"n":561730,"d":"Landscape Maintenance Services","s":"FL","y":2023,"r":513393,"e":278229,"m":1.17},{"n":238290,"d":"Sales, installation and Repair of Overhead Door Systems","s":"TX","y":2023,"r":1412516,"e":245519,"m":1.97},{"n":238110,"d":"Concrete Structural Repair and Coating Company","s":"FL","y":2023,"r":5887896,"e":503707,"m":3.18},{"n":238210,"d":"Electrical Contracting Business (Home-Based Business)","s":"GA","y":2023,"r":1633684,"e":239369,"m":3.26},{"n":238290,"d":"Exterior and Interior Finishes Contractor","s":"OR","y":2023,"r":1225064,"e":250917,"m":2.99},{"n":238220,"d":"Air Conditioning Service and Installation Company (60% Residential and 40% Comme","s":"FL","y":2023,"r":2270547,"e":465569,"m":3.29},{"n":238220,"d":"Air Conditioning Service and Installation Company (95% Residential and 5% Commer","s":"FL","y":2023,"r":1158375,"e":167209,"m":2.39},{"n":561730,"d":"Landscape and Pressure Washing Business","s":"FL","y":2023,"r":937589,"e":219721,"m":2.66},{"n":561730,"d":"Residential and Commercial Landscape and Pressure Washing (Home-Based Business)","s":"FL","y":2023,"r":903270,"e":226542,"m":2.58},{"n":238160,"d":"Roofing Contractor","s":"","y":2023,"r":1614566,"e":383080,"m":1.96},{"n":561730,"d":"Landscape Maintenance Company (Home-Based Office)","s":"CA","y":2023,"r":3218317,"e":474289,"m":2.79},{"n":238350,"d":"Woodworking and Millwork Company","s":"FL","y":2023,"r":841124,"e":125564,"m":5.57},{"n":561730,"d":"Commercial Landscaping Company","s":"HI","y":2023,"r":1148833,"e":408817,"m":2.14},{"n":238210,"d":"Electrical Contractor (Home-Based Business)","s":"FL","y":2023,"r":959820,"e":326339,"m":1.69},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2023,"r":3044842,"e":786760,"m":4.32},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2023,"r":789465,"e":288438,"m":1.91},{"n":444180,"d":"Plumbing Supply Business","s":"IL","y":2023,"r":6880000,"e":658000,"m":2.93},{"n":236118,"d":"General Remodeling Contractor","s":"CO","y":2023,"r":797343,"e":209802,"m":0.72},{"n":238220,"d":"Air Conditioning Service (90% Residential, 9% Commercial and 1% New Construction","s":"FL","y":2023,"r":1682395,"e":322858,"m":1.97},{"n":423390,"d":"Construction Material Distributor","s":"FL","y":2023,"r":10228823,"e":552082,"m":2.9},{"n":238210,"d":"Electrical Service Company","s":"GA","y":2023,"r":4345035,"e":1268379,"m":4.14},{"n":238990,"d":"Paving Company","s":"CO","y":2023,"r":4624059,"e":1106020,"m":2.17},{"n":236118,"d":"Kitchen and Bathroom Remodeling Business","s":"FL","y":2023,"r":727125,"e":156576,"m":2.59},{"n":238990,"d":"Speciality Contractor","s":"FL","y":2023,"r":180000,"e":123130,"m":1.18},{"n":561730,"d":"Residential and Commercial Landscaping Business","s":"MA","y":2023,"r":562151,"e":196415,"m":0.92},{"n":561730,"d":"Commercial and Residential Landscape Business","s":"MA","y":2023,"r":602392,"e":227584,"m":1.21},{"n":238160,"d":"Residential Roofing Installer","s":"FL","y":2023,"r":24599754,"e":4910049,"m":7.94},{"n":238210,"d":"Commercial Electrical Contractor (Home-Based Business)","s":"CO","y":2023,"r":2393107,"e":1042870,"m":2.92},{"n":238220,"d":"HVAC Contractor (40% Residential Service and 60% Residential Maintenance and Ins","s":"FL","y":2023,"r":2561696,"e":313893,"m":2.55},{"n":238220,"d":"Residential Plumbing Services","s":"CA","y":2023,"r":1529931,"e":173638,"m":2.3},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2023,"r":845121,"e":145176,"m":3.1},{"n":444110,"d":"Retail Building Materials Store","s":"SK","y":2023,"r":7679967,"e":670493,"m":8.2},{"n":238220,"d":"Air Conditioning Contractor (95% Residential)","s":"FL","y":2023,"r":1414871,"e":498576,"m":3.31},{"n":561730,"d":"Residential Exterior Landscaping Services","s":"NC","y":2023,"r":270750,"e":107329,"m":1.54},{"n":238320,"d":"Painting Contractor (70% Commercial and 30% Residential)","s":"FL","y":2023,"r":370891,"e":106625,"m":1.64},{"n":561730,"d":"Landscape Lighting Company (Home-Based Business)","s":"FL","y":2023,"r":321782,"e":163496,"m":1.9},{"n":236115,"d":"New Single-Family Housing Construction","s":"FL","y":2023,"r":13747985,"e":668061,"m":2.92},{"n":236220,"d":"Data Center Moving and Construction","s":"TX","y":2023,"r":10505719,"e":1686661,"m":3.72},{"n":236118,"d":"Residential Remodeling and Maintenance Contractor","s":"FL","y":2023,"r":5582887,"e":1143546,"m":2.36},{"n":238220,"d":"Air Conditioning Company","s":"FL","y":2023,"r":475340,"e":204941,"m":0.98},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2023,"r":557247,"e":134103,"m":2.8},{"n":237310,"d":"Civil Construction Company","s":"FL","y":2023,"r":10953320,"e":4457068,"m":0.85},{"n":236118,"d":"Residential Remodeler Contractor","s":"VA","y":2023,"r":2501000,"e":325000,"m":2.32},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2023,"r":897978,"e":125903,"m":2.98},{"n":238290,"d":"Commercial and Residential Glass and Door Control Install Company","s":"SC","y":2023,"r":1332382,"e":390000,"m":2.12},{"n":238990,"d":"Paver Installation Business","s":"FL","y":2023,"r":965080,"e":209923,"m":1.43},{"n":238210,"d":"Electrical Service and Repair Company","s":"FL","y":2023,"r":1971207,"e":369928,"m":2.97},{"n":238990,"d":"Specialty Trade Contractor","s":"FL","y":2023,"r":4619865,"e":523304,"m":4.59},{"n":561730,"d":"Landscape Maintenance","s":"CA","y":2023,"r":2303801,"e":219755,"m":2.5},{"n":238170,"d":"Residential Gutter Business","s":"FL","y":2023,"r":1095199,"e":198034,"m":2.88},{"n":238210,"d":"Electrical Contractor","s":"CO","y":2023,"r":22435683,"e":3218300,"m":3.92},{"n":238990,"d":"Christmas Lights Installation (Home-Based Business)","s":"GA","y":2023,"r":111995,"e":86289,"m":1.16},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2023,"r":390639,"e":103422,"m":1.6},{"n":236115,"d":"Construction Project Management and Consulting (Home-Based Business)","s":"GA","y":2023,"r":435751,"e":94544,"m":2.38},{"n":238220,"d":"Plumbing, Heating, and Air-Conditioning Contractor","s":"FL","y":2023,"r":963507,"e":153801,"m":4.55},{"n":238990,"d":"Holiday Christmas Lights Business","s":"FL","y":2023,"r":115513,"e":64171,"m":1.48},{"n":238220,"d":"Residential HVAC/R Business (30% of Business is Service and 70% Residential New ","s":"FL","y":2023,"r":4717816,"e":1347401,"m":2.97},{"n":238160,"d":"Roof Testing Company","s":"FL","y":2023,"r":1232600,"e":468886,"m":2.77},{"n":238140,"d":"Building Stucco Repair Company","s":"TX","y":2023,"r":3406992,"e":1200000,"m":3.33},{"n":561730,"d":"Lawn and Landscaping Company","s":"FL","y":2023,"r":1716766,"e":211562,"m":4.25},{"n":238140,"d":"Pizza Restaurant","s":"","y":2023,"r":1563520,"e":204114,"m":2.45},{"n":238110,"d":"Concrete Construction Contractor","s":"SC","y":2023,"r":2425968,"e":450973,"m":2.66},{"n":561730,"d":"Commercial Landscaping and Maintenance Business","s":"UT","y":2023,"r":2778228,"e":726291,"m":2.75},{"n":561730,"d":"Lawn and Landscaping Business","s":"FL","y":2023,"r":437862,"e":156542,"m":1.39},{"n":238210,"d":"Electrical Contractor","s":"IL","y":2023,"r":3745000,"e":851634,"m":3.58},{"n":238350,"d":"Cabinet Resurfacing","s":"FL","y":2023,"r":3502810,"e":358198,"m":3.21},{"n":238210,"d":"Electric and Commercial-Focused Construction Company","s":"CA","y":2023,"r":6017341,"e":880781,"m":3.07},{"n":238330,"d":"Flooring Contractor","s":"FL","y":2023,"r":2012679,"e":863254,"m":2.31},{"n":236220,"d":"General Contracting Services","s":"FL","y":2023,"r":3493084,"e":777158,"m":1.8},{"n":561730,"d":"Lawn Maintenance and Landscaping Business","s":"FL","y":2023,"r":293312,"e":76699,"m":2.01},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2023,"r":2793668,"e":447909,"m":2.01},{"n":238220,"d":"Air Conditioning and Heating Contractor (60% Residential and 40% Light Commercia","s":"FL","y":2023,"r":4059032,"e":471273,"m":4.88},{"n":236118,"d":"Home Remodeling Company","s":"OH","y":2023,"r":3174630,"e":463004,"m":1.73},{"n":561730,"d":"Landscape Business","s":"PA","y":2023,"r":818000,"e":224239,"m":2.79},{"n":238220,"d":"Air Conditioning and Heating Contractor","s":"FL","y":2023,"r":1258042,"e":298776,"m":2.93},{"n":238220,"d":"Residential Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"NC","y":2023,"r":7785172,"e":2609312,"m":5.52},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"QC","y":2023,"r":4698000,"e":423000,"m":3.9},{"n":444110,"d":"Lumberyard","s":"MI","y":2023,"r":30914314,"e":2604844,"m":2.92},{"n":238110,"d":"Concrete Pumping and Spraying for Swimming Pool Construction","s":"QLD","y":2023,"r":1086838,"e":165761,"m":1.09},{"n":561730,"d":"Landscape Design, Construction, and Maintenance Company","s":"ID","y":2023,"r":5555402,"e":1431801,"m":4.4},{"n":561730,"d":"Landscape Design and Maintenance","s":"ID","y":2023,"r":7355710,"e":1121808,"m":6.86},{"n":236115,"d":"Custom Home Builder","s":"NC","y":2023,"r":2747790,"e":406528,"m":4.3},{"n":238350,"d":"Kitchen and Bath Design and Installation Company","s":"CO","y":2023,"r":12613553,"e":1410239,"m":1.77},{"n":238220,"d":"Commercial, Residential, and Service Plumbing Company (45% Commercial Remodel/Re","s":"OR","y":2023,"r":2717505,"e":264290,"m":2.01},{"n":236118,"d":"Pizza Restaurant","s":"","y":2023,"r":452524,"e":92671,"m":2.54},{"n":236220,"d":"Building Renovations","s":"FL","y":2023,"r":710000,"e":152900,"m":0.52},{"n":238990,"d":"Commercial Fencing Contractor","s":"AZ","y":2023,"r":6513953,"e":2170095,"m":1.96},{"n":238320,"d":"Painting Contractor","s":"FL","y":2023,"r":1079620,"e":221180,"m":2.49},{"n":561730,"d":"Landscaping Business","s":"FL","y":2023,"r":193373,"e":71810,"m":1.32},{"n":236118,"d":"Patio and Remodeling Contractor","s":"CA","y":2023,"r":6782334,"e":1150000,"m":2.26},{"n":238390,"d":"Environmental Construction Company","s":"FL","y":2023,"r":7977144,"e":2417539,"m":1.24},{"n":238990,"d":"Residential Fence and Gate Installation","s":"CA","y":2023,"r":1100000,"e":300000,"m":2.67},{"n":332322,"d":"Precision Sheet Metal Fabrication","s":"NJ","y":2023,"r":2758175,"e":618197,"m":2.59},{"n":561730,"d":"Residential and Commercial Landscape Maintenance Business","s":"CO","y":2023,"r":572649,"e":115256,"m":2.26},{"n":561730,"d":"Landscape Construction and Maintenance","s":"ID","y":2023,"r":4246780,"e":499957,"m":3.68},{"n":236118,"d":"Handyman Service Franchise","s":"CA","y":2023,"r":944339,"e":344496,"m":1.6},{"n":238220,"d":"Plumbing and Heating, Ventilation, and Air Conditioning (HVAC) Service Business","s":"CA","y":2023,"r":2556731,"e":342849,"m":2.33},{"n":238350,"d":"Boutique Cabinet Shop","s":"FL","y":2023,"r":502009,"e":123265,"m":1.62},{"n":561730,"d":"Landscaping Residential and Commercial (Home-Based Business)","s":"BC","y":2023,"r":353890,"e":131374,"m":1.71},{"n":444180,"d":"Building Materials Business","s":"OR","y":2023,"r":10614302,"e":1272069,"m":2.91},{"n":238330,"d":"Flooring Contractor","s":"FL","y":2023,"r":528629,"e":69932,"m":0.93},{"n":238220,"d":"HVAC and Refrigeration Company","s":"NC","y":2023,"r":2106000,"e":315000,"m":3.43},{"n":561730,"d":"Landscaping and Maintenance Company","s":"FL","y":2023,"r":1900783,"e":527464,"m":2.65},{"n":236118,"d":"Multi-Family Reconstruction General Contractor","s":"FL","y":2023,"r":18323190,"e":3793283,"m":4.48},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Testing and Balancing Company","s":"CO","y":2023,"r":1666876,"e":368117,"m":2.72},{"n":238330,"d":"Floor Restoration","s":"FL","y":2023,"r":373853,"e":196366,"m":2.75},{"n":238220,"d":"Residential Heating and Air Conditioning Business","s":"FL","y":2023,"r":1581175,"e":479723,"m":2.29},{"n":238350,"d":"Windows and Doors Contractor","s":"MI","y":2023,"r":290000,"e":120000,"m":1.13},{"n":238290,"d":"Overhead Door Business","s":"FL","y":2023,"r":2933851,"e":1050313,"m":1.14},{"n":238220,"d":"Heating, Ventilation, and Cooling (HVAC) Business (73% Residential, 27% Commerci","s":"FL","y":2023,"r":2879192,"e":252033,"m":3.97},{"n":238220,"d":"Residential Heating and Air Conditioning Business (100% Residential)","s":"FL","y":2023,"r":882153,"e":75672,"m":4.63},{"n":236118,"d":"Residential and Commercial General Contractor Business","s":"SC","y":2023,"r":1040141,"e":322898,"m":3.25},{"n":238220,"d":"Residential Heating and Air Conditioning Business","s":"FL","y":2023,"r":1178597,"e":564914,"m":1.95},{"n":238210,"d":"Access Control and Security Systems Contractor","s":"VA","y":2023,"r":3196944,"e":339488,"m":4.27},{"n":332322,"d":"Precision Sheet Metal Fabrication Company","s":"CO","y":2023,"r":2607150,"e":750000,"m":3.93},{"n":237990,"d":"Civil Engineering Construction","s":"FL","y":2023,"r":600521,"e":131987,"m":3.03},{"n":236118,"d":"Home Improvement Business Franchise","s":"MD","y":2023,"r":838000,"e":104000,"m":1.43},{"n":238220,"d":"Residential Heating and Air Conditioning Business","s":"FL","y":2023,"r":3715587,"e":579285,"m":5.52},{"n":238350,"d":"Cabinet Resurfacing and Refacing Business","s":"CO","y":2023,"r":1910722,"e":510108,"m":3.29},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2023,"r":1213939,"e":237804,"m":0.67},{"n":238220,"d":"Water Filtration Equipment Sales and Services","s":"NE","y":2023,"r":193000,"e":86150,"m":2.61},{"n":238340,"d":"Tiling Contractor Franchise","s":"FL","y":2023,"r":453262,"e":138460,"m":1.19},{"n":238990,"d":"Garage Door Services","s":"WA","y":2023,"r":3247326,"e":545050,"m":1.8},{"n":238220,"d":"HVAC Contractor","s":"FL","y":2023,"r":9167099,"e":1207184,"m":4.97},{"n":238390,"d":"Fabricated Interior and Exterior Stairs Specialist","s":"FL","y":2023,"r":5106683,"e":1038484,"m":4.14},{"n":238220,"d":"HVAC Company","s":"FL","y":2023,"r":1394432,"e":312758,"m":2.88},{"n":238350,"d":"Cabinet Contractor","s":"FL","y":2023,"r":2736937,"e":429700,"m":2.33},{"n":238220,"d":"Residential Plumbing Business (95% Residential and 5% Commercial) (Home-Based Bu","s":"FL","y":2023,"r":218350,"e":102130,"m":1.17},{"n":236118,"d":"Home Repairs and Remodeling Services Franchise","s":"MN","y":2023,"r":754883,"e":116695,"m":2.36},{"n":238990,"d":"Screening Contractor","s":"FL","y":2023,"r":1091351,"e":433982,"m":0.6},{"n":561730,"d":"Landscaping Company","s":"FL","y":2023,"r":1205662,"e":283154,"m":4.41},{"n":561730,"d":"Aquascape and Landscape service company","s":"OK","y":2023,"r":446438,"e":195282,"m":2.3},{"n":238390,"d":"Garage Floor Coatings and Organizing","s":"FL","y":2023,"r":850000,"e":413750,"m":1.2},{"n":561730,"d":"Landscaping Business","s":"FL","y":2023,"r":1450000,"e":412836,"m":3.03},{"n":561730,"d":"Lawn and Landscaping Business","s":"FL","y":2023,"r":521669,"e":146829,"m":1.8},{"n":236118,"d":"Building Renovations","s":"GA","y":2023,"r":1500000,"e":276700,"m":1.43},{"n":238110,"d":"Concrete Contractor","s":"FL","y":2023,"r":88413,"e":63496,"m":0.79},{"n":238220,"d":"Residential and Commercial HVAC Services","s":"NC","y":2023,"r":365614,"e":156548,"m":1.92},{"n":238350,"d":"Residential Garage Door Installer","s":"FL","y":2023,"r":1869636,"e":481925,"m":3.94},{"n":238220,"d":"Residential Heating and Air Conditioning Business (95% Residential and 5% Light ","s":"FL","y":2023,"r":2996137,"e":410420,"m":4.39},{"n":238990,"d":"Screening Contractor","s":"FL","y":2023,"r":1717298,"e":171779,"m":5.07},{"n":561730,"d":"Commercial Landscape Business","s":"FL","y":2023,"r":2192752,"e":406763,"m":3.2},{"n":238290,"d":"Garage Door Sales and Service","s":"PA","y":2023,"r":2323581,"e":582603,"m":2.19},{"n":238990,"d":"Asphalt Paving and Maintenance","s":"IL","y":2023,"r":3320643,"e":1746000,"m":1.87},{"n":238220,"d":"Plumbing Company","s":"IL","y":2023,"r":3447879,"e":675948,"m":3.85},{"n":238990,"d":"Asphalt Paving Company","s":"MO","y":2023,"r":1780381,"e":419877,"m":2.5},{"n":238220,"d":"HVAC Company","s":"NJ","y":2023,"r":1531628,"e":323255,"m":2.01},{"n":238220,"d":"Heating and Air Conditioning Business (64% Residential and 36% Commercial)","s":"FL","y":2023,"r":2456913,"e":705750,"m":2.55},{"n":238220,"d":"Fire Sprinkler Systems Contractor","s":"FL","y":2023,"r":2459511,"e":226725,"m":2.21},{"n":561320,"d":"Oil and Gas Pipeline Staffing Services (Home-Based Business)","s":"TX","y":2023,"r":800000,"e":255000,"m":0.79},{"n":238990,"d":"Coatings Contractor","s":"FL","y":2023,"r":5394937,"e":1322043,"m":1.89},{"n":238220,"d":"Air Conditioning and Heating Company","s":"FL","y":2023,"r":938068,"e":195615,"m":2.02},{"n":561730,"d":"Full-Service Landscape Construction and Maintenance Business","s":"CA","y":2023,"r":534085,"e":281332,"m":0.89},{"n":238220,"d":"Residential Plumbing Company","s":"FL","y":2023,"r":124910,"e":69178,"m":0.58},{"n":238220,"d":"Plumbing Company (90% residential, 10% commercial)","s":"FL","y":2023,"r":1494595,"e":342452,"m":4.38},{"n":238220,"d":"Plumbing Service Center","s":"VA","y":2023,"r":1065822,"e":127972,"m":2.58},{"n":561730,"d":"Interior Landscaping Services","s":"FL","y":2023,"r":247440,"e":114044,"m":1.74},{"n":561730,"d":"Residential Landscaping Business","s":"NC","y":2023,"r":210918,"e":115080,"m":0.61},{"n":238160,"d":"Roofing Contractor (95% Residential)","s":"FL","y":2023,"r":2857182,"e":472360,"m":2.19},{"n":238220,"d":"Air Duct Cleaning and HVAC Business","s":"CO","y":2023,"r":773174,"e":197052,"m":1.42},{"n":238220,"d":"Plumbing and Remodel Business","s":"FL","y":2023,"r":921496,"e":253800,"m":1.97},{"n":238330,"d":"Flooring and General Contractor","s":"CA","y":2023,"r":3495497,"e":705749,"m":0.71},{"n":238310,"d":"Acoustical Tile Contractor","s":"VA","y":2023,"r":1122740,"e":94320,"m":12.19},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"NJ","y":2023,"r":1471446,"e":294961,"m":2.86},{"n":238310,"d":"Spray Foam Contractor","s":"ON","y":2023,"r":1896302,"e":425470,"m":2.6},{"n":238330,"d":"Flooring and Remodeling Business","s":"TX","y":2023,"r":3550278,"e":516161,"m":2.08},{"n":561730,"d":"Landscaping and Irrigation Company (90% residential, 10% commercial)","s":"FL","y":2023,"r":257409,"e":175185,"m":0.8},{"n":238910,"d":"Excavation Company","s":"CO","y":2023,"r":2708181,"e":709821,"m":1.41},{"n":238220,"d":"Commercial and Residential Plumbing Company","s":"FL","y":2023,"r":607085,"e":197045,"m":2.03},{"n":238210,"d":"Electrical Contractor","s":"GA","y":2023,"r":10129521,"e":1375522,"m":4.58},{"n":332311,"d":"Metal Building Manufacturer and General Contractor","s":"TX","y":2023,"r":15986598,"e":902506,"m":8.75},{"n":238350,"d":"Kitchen Cabinet and Countertop Fabrication and Installation","s":"FL","y":2023,"r":9406230,"e":1305866,"m":2.22},{"n":238220,"d":"Plumbing Company","s":"FL","y":2023,"r":317752,"e":122366,"m":1.31},{"n":332999,"d":"Manufactures and Distributes Aluminum and Steel Supports for Hurricane Shutter S","s":"FL","y":2023,"r":1331965,"e":657503,"m":2.28},{"n":238320,"d":"Painting Business","s":"NC","y":2023,"r":339100,"e":105841,"m":1.7},{"n":561730,"d":"Lawn and Landscape Business","s":"FL","y":2023,"r":193083,"e":122485,"m":0.69},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2023,"r":1115668,"e":72307,"m":3.49},{"n":561730,"d":"Landscape Contractor","s":"WA","y":2023,"r":1560929,"e":275000,"m":1.82},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2023,"r":4329821,"e":473198,"m":1.9},{"n":561730,"d":"Lawn Care and Landscape Company","s":"FL","y":2023,"r":447059,"e":186708,"m":2.25},{"n":238220,"d":"Commercial Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"","y":2023,"r":2088115,"e":518448,"m":1.97},{"n":238220,"d":"Plumbing Company","s":"FL","y":2023,"r":859936,"e":86860,"m":2.19},{"n":238220,"d":"HVAC Heating, Ventilation and Air Business","s":"NC","y":2023,"r":855357,"e":177419,"m":1.89},{"n":238220,"d":"Commercial and Residential HVAC Company","s":"FL","y":2023,"r":1635388,"e":234747,"m":2.3},{"n":238310,"d":"Drywall Contractor","s":"FL","y":2023,"r":4270036,"e":298856,"m":1.51},{"n":238990,"d":"Fencing Contractor","s":"NJ","y":2023,"r":2277068,"e":279042,"m":1.34},{"n":238330,"d":"Flooring Contractor with Showroom","s":"CA","y":2023,"r":1304644,"e":369066,"m":1.35},{"n":238150,"d":"Glass Contractor","s":"FL","y":2023,"r":755981,"e":258264,"m":1.55},{"n":238220,"d":"HVAC Company","s":"FL","y":2023,"r":324468,"e":73899,"m":0.74},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"WY","y":2023,"r":3352619,"e":682615,"m":2.64},{"n":237990,"d":"Constructs and Installs Residential Seawalls, Docks, and Boatlifts","s":"FL","y":2023,"r":1365364,"e":231445,"m":3.81},{"n":238350,"d":"Cabinet Installer","s":"NC","y":2023,"r":2437715,"e":2500000,"m":0.35},{"n":238350,"d":"Cabinet Installer","s":"OH","y":2023,"r":3951208,"e":57232,"m":13.1},{"n":238150,"d":"Installs Residential High Impact Resistant Windows, Doors, and Accordion Shutter","s":"FL","y":2023,"r":7058933,"e":433099,"m":3.35},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning Contractor for Both Residential and C","s":"ID","y":2023,"r":4386947,"e":1460045,"m":2.26},{"n":238210,"d":"Residential and Commercial Electrical Contractor","s":"FL","y":2023,"r":1171206,"e":296009,"m":2.7},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2023,"r":1770000,"e":400000,"m":2.23},{"n":238990,"d":"Specialty Contractor and Cleaning Service","s":"OR","y":2023,"r":1091000,"e":267464,"m":4.86},{"n":238150,"d":"Full-Service Custom Glass and Screen Business","s":"AZ","y":2023,"r":1645503,"e":391897,"m":1.4},{"n":238290,"d":"Overhead Door Company","s":"NC","y":2023,"r":1096631,"e":225983,"m":1.99},{"n":238220,"d":"Plumbing and Heating Contractor","s":"CA","y":2023,"r":1100000,"e":150000,"m":1.9},{"n":238220,"d":"HVAC company","s":"CA","y":2023,"r":8580000,"e":1500000,"m":3.8},{"n":561730,"d":"Lawn and Landscaping Business","s":"FL","y":2023,"r":196505,"e":100177,"m":1.55},{"n":561730,"d":"Commercial and Residential Landscape Services","s":"TX","y":2023,"r":7517329,"e":780250,"m":2.82},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2023,"r":23500000,"e":4275026,"m":2.92},{"n":238910,"d":"Construction Site Preparation Service","s":"FL","y":2023,"r":2994379,"e":1081409,"m":3.19},{"n":238210,"d":"Commercial Electric Company","s":"AZ","y":2023,"r":34177,"e":25000,"m":2.2},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2023,"r":6936566,"e":350386,"m":9.7},{"n":238160,"d":"Roofing Contractor","s":"OH","y":2023,"r":2065810,"e":191161,"m":3.01},{"n":238110,"d":"Residential and Commercial Concrete Contractor","s":"MI","y":2023,"r":1014886,"e":282397,"m":1.56},{"n":561730,"d":"Landscaping Company","s":"FL","y":2023,"r":487846,"e":198992,"m":1.46},{"n":238910,"d":"Excavation Company","s":"NC","y":2023,"r":4549904,"e":331423,"m":11.39},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Company","s":"CO","y":2023,"r":2510694,"e":446636,"m":1.47},{"n":423720,"d":"Distributor of Plumbing Supplies","s":"FL","y":2023,"r":1024222,"e":199082,"m":2.64},{"n":237310,"d":"Paving Company","s":"NY","y":2023,"r":5374473,"e":967177,"m":5.17},{"n":238210,"d":"Commercial Electrical Contractor (Home-Based Business)","s":"CO","y":2023,"r":1431919,"e":228489,"m":1.86},{"n":237110,"d":"Provides Water Pump Installation, Repair, and Sales for Both Residential and Com","s":"CA","y":2023,"r":1501909,"e":202995,"m":5.05},{"n":238990,"d":"Swimming Pool Construction and Service","s":"FL","y":2023,"r":1509685,"e":569990,"m":3.16},{"n":238350,"d":"Supplies and Installs Windows, Glass, Doors, Frames, and Hardware Products for C","s":"ON","y":2023,"r":1297165,"e":346095,"m":2.74},{"n":238330,"d":"Crematory Sales And Services Business","s":"","y":2023,"r":1446476,"e":179535,"m":4.18},{"n":236118,"d":"Residential Remodelers","s":"CA","y":2023,"r":2190853,"e":336683,"m":1.49},{"n":238220,"d":"Plumbing Services","s":"UT","y":2023,"r":384802,"e":202570,"m":1.88},{"n":541618,"d":"Construction Management Consulting Firm","s":"MT","y":2023,"r":2148686,"e":543787,"m":2.37},{"n":238220,"d":"Commercial and Residential Plumbing Company","s":"FL","y":2023,"r":646179,"e":148744,"m":1.18},{"n":236118,"d":"Home Improvement Contractor Franchise","s":"PA","y":2023,"r":531077,"e":103090,"m":1.93},{"n":238220,"d":"Commercial HVAC Company","s":"FL","y":2023,"r":1236694,"e":458523,"m":3.93},{"n":236115,"d":"Home Construction Business","s":"CO","y":2023,"r":34131463,"e":3127317,"m":1.76},{"n":238210,"d":"Generator Dealer Franchise","s":"NC","y":2023,"r":3288417,"e":221325,"m":2.49},{"n":238210,"d":"Electrical and Utility Contactor","s":"FL","y":2023,"r":28581638,"e":3582207,"m":3.77},{"n":561730,"d":"Landscaping Service","s":"SC","y":2023,"r":105157,"e":52401,"m":2.09},{"n":238220,"d":"HVAC Contractor (80% residential, 20% commercial)","s":"FL","y":2023,"r":2775525,"e":535648,"m":4.2},{"n":238220,"d":"Commercial Construction Plumber","s":"FL","y":2023,"r":741184,"e":347897,"m":1.78},{"n":561730,"d":"Landscape Services","s":"TX","y":2023,"r":325947,"e":99663,"m":2.57},{"n":561730,"d":"Commercial and Residential Landscaping","s":"CO","y":2023,"r":4168917,"e":1105765,"m":2.08},{"n":238220,"d":"Plumbing Business","s":"WI","y":2023,"r":1450000,"e":170000,"m":4.42},{"n":238210,"d":"Electric Contractor","s":"UT","y":2023,"r":6647026,"e":858972,"m":3.03},{"n":238220,"d":"Industrial Refrigeration Contractor","s":"","y":2023,"r":11692000,"e":1777000,"m":5.64},{"n":238220,"d":"Commercial Heating, Ventilation, and Air Conditioning (HVAC) and Refrigeration C","s":"CA","y":2023,"r":1407117,"e":363659,"m":2.39},{"n":238170,"d":"Gutter Contractor","s":"FL","y":2023,"r":1600117,"e":244377,"m":3.07},{"n":238390,"d":"Gutter Fabrication and Installation Company","s":"SC","y":2023,"r":573134,"e":140797,"m":2.73},{"n":238210,"d":"Security Systems","s":"NC","y":2023,"r":8024459,"e":2542643,"m":4.07},{"n":561730,"d":"Lawn Care and Landscape Company (50% residential, 50% commercial)","s":"FL","y":2023,"r":740379,"e":277075,"m":1.97},{"n":238110,"d":"Paving Contractor","s":"BC","y":2023,"r":2982282,"e":797348,"m":3.32},{"n":238990,"d":"Fencing Contractor","s":"NJ","y":2023,"r":6815362,"e":1696633,"m":1.65},{"n":238210,"d":"Electric Contractor","s":"PA","y":2023,"r":1013035,"e":440472,"m":1.02},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"","y":2023,"r":20977316,"e":4285226,"m":5.13},{"n":561730,"d":"Commercial Landscaping","s":"TX","y":2023,"r":209140,"e":74310,"m":0.94},{"n":238160,"d":"Roofing Contractor","s":"TX","y":2023,"r":5652442,"e":927580,"m":6.82},{"n":238220,"d":"Plumbing Contractor","s":"CA","y":2023,"r":3702421,"e":1080996,"m":2.41},{"n":236118,"d":"Kitchen and Bath Remodeling Company","s":"FL","y":2023,"r":1370495,"e":250538,"m":1.59},{"n":238220,"d":"HVAC Company (90% residential, 10% commercial)","s":"FL","y":2023,"r":2081173,"e":591403,"m":1.01},{"n":423390,"d":"Multi-Location Distributor of Specialty Construction Products","s":"SC","y":2023,"r":10046810,"e":3581531,"m":1.81},{"n":238990,"d":"Fencing Contractor","s":"FL","y":2023,"r":661755,"e":71054,"m":4.9},{"n":238210,"d":"Generator Maintenance, Repair, and Installation Business","s":"FL","y":2023,"r":3039486,"e":314051,"m":2.79},{"n":238220,"d":"HVAC Company","s":"FL","y":2023,"r":923369,"e":161896,"m":2.34},{"n":236118,"d":"Home Improvement Contractor","s":"FL","y":2023,"r":1698383,"e":291526,"m":1.2},{"n":238210,"d":"Audio/Video Integration Company","s":"FL","y":2023,"r":1019005,"e":200056,"m":2.62},{"n":238210,"d":"Design and Installation of Sound Reinforcement Systems","s":"","y":2023,"r":2636070,"e":225822,"m":13.66},{"n":238220,"d":"Residential Plumbing Company","s":"FL","y":2023,"r":4456449,"e":490408,"m":0.88},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Services","s":"UT","y":2023,"r":1141911,"e":205216,"m":4.63},{"n":238220,"d":"Heating, Ventilation, And Air Conditioning (HVAC) Contractor","s":"UT","y":2023,"r":1055203,"e":326179,"m":2.91},{"n":238210,"d":"Electrical Contractor Design, Consulting, and Installation","s":"WA","y":2023,"r":1750366,"e":537922,"m":2.79},{"n":238220,"d":"Plumbing Contractor (50% Residential and 50% Commercial)","s":"TX","y":2023,"r":1131559,"e":100000,"m":4.0},{"n":238220,"d":"Mechanical Services Company","s":"NJ","y":2023,"r":23029423,"e":2970722,"m":2.76},{"n":238220,"d":"Commercial and Residential Irrigation Business","s":"FL","y":2023,"r":661755,"e":186578,"m":2.09},{"n":238210,"d":"Electric Contractor","s":"TX","y":2023,"r":1043130,"e":71571,"m":4.19},{"n":238110,"d":"Paving Contractor","s":"PA","y":2023,"r":721403,"e":131473,"m":1.92},{"n":238150,"d":"Window and Door Installation Company","s":"FL","y":2023,"r":6021592,"e":1091499,"m":2.84},{"n":238220,"d":"Residential Plumbing Company","s":"FL","y":2023,"r":293845,"e":72638,"m":2.07},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"MN","y":2023,"r":646386,"e":288972,"m":1.21},{"n":238220,"d":"Plumbing Company (75% residential, 25% commercial)","s":"FL","y":2023,"r":2133308,"e":600788,"m":3.99},{"n":238220,"d":"Heating, Ventilation, And Air Conditioning (HVAC) Contractor","s":"MB","y":2023,"r":3391000,"e":1371000,"m":2.78},{"n":423310,"d":"Distribution Company of Lumber, Plumbing, and Hardware","s":"FL","y":2023,"r":2962863,"e":405372,"m":1.73},{"n":236118,"d":"Remodeling Company that Specializes in Remodeling Kitchens and Bathrooms","s":"TX","y":2023,"r":2073964,"e":506180,"m":2.37},{"n":237990,"d":"Marine Contractor","s":"FL","y":2023,"r":466183,"e":94244,"m":1.7},{"n":238110,"d":"Concrete and Masonry Contractor","s":"FL","y":2023,"r":1980261,"e":563924,"m":2.13},{"n":236118,"d":"Handyman and Light Construction Business","s":"CO","y":2023,"r":796000,"e":104000,"m":1.83},{"n":238220,"d":"Residential and Commercial Heating, Ventilation, and Air Conditioning (HVAC) Con","s":"CA","y":2023,"r":773431,"e":273265,"m":2.38},{"n":238190,"d":"Sells and Installs Sunset and SunPro Motorized Awnings and Screens","s":"SC","y":2023,"r":2673796,"e":607180,"m":1.98},{"n":541310,"d":"Landscape Architecture Company","s":"CO","y":2023,"r":811223,"e":259334,"m":2.31},{"n":238990,"d":"Fencing Contractor","s":"FL","y":2023,"r":462328,"e":61735,"m":2.09},{"n":561730,"d":"Landscaping Company","s":"NY","y":2023,"r":531346,"e":196210,"m":1.91},{"n":238220,"d":"HVAC Company","s":"FL","y":2023,"r":624520,"e":80116,"m":4.18},{"n":236118,"d":"Home Remodeling Company","s":"KY","y":2023,"r":1689320,"e":264619,"m":2.83},{"n":238220,"d":"HVAC Company","s":"FL","y":2023,"r":617912,"e":204215,"m":1.47},{"n":238990,"d":"Fencing Contractor","s":"FL","y":2023,"r":1556400,"e":242165,"m":0.91},{"n":238210,"d":"Commercial Electrical Contractor (Home-Based Business)","s":"CA","y":2023,"r":4180230,"e":244323,"m":3.68},{"n":238220,"d":"Residential HVAC Service","s":"FL","y":2023,"r":646076,"e":171042,"m":3.22},{"n":238210,"d":"Electric Contractor","s":"NJ","y":2023,"r":1252140,"e":459577,"m":1.09},{"n":561720,"d":"Full-Service Heating, Ventilation, and Air Conditioning (HVAC) Cleaning Business","s":"AB","y":2023,"r":46558,"e":40939,"m":3.42},{"n":236118,"d":"Full-service Residential Remodeler","s":"TX","y":2023,"r":3062694,"e":313064,"m":1.9},{"n":238220,"d":"Air Conditioning Installation and Maintenance","s":"QLD","y":2023,"r":603892,"e":185424,"m":1.5},{"n":238220,"d":"Water Treatment and Plumbing Business","s":"MN","y":2023,"r":698650,"e":236380,"m":2.24},{"n":561730,"d":"Landscaping Service","s":"NJ","y":2023,"r":459367,"e":133497,"m":2.4},{"n":238220,"d":"Plumbing Company","s":"FL","y":2023,"r":1384231,"e":305896,"m":3.92},{"n":238220,"d":"Sprinkler and Irrigation Company","s":"FL","y":2023,"r":216450,"e":107657,"m":0.86},{"n":238160,"d":"Roofing Contractor","s":"CA","y":2023,"r":2100000,"e":315322,"m":0.82},{"n":238220,"d":"Plumbing Services","s":"AZ","y":2023,"r":816373,"e":337758,"m":2.81},{"n":238220,"d":"HVAC Contractor (90% residential, 10% commercial)","s":"FL","y":2023,"r":2460373,"e":559295,"m":5.72},{"n":238390,"d":"Window Coverings Installation","s":"GA","y":2023,"r":1528000,"e":450000,"m":2.39},{"n":561730,"d":"Landscaper","s":"CA","y":2023,"r":856356,"e":228000,"m":2.19},{"n":459999,"d":"Glass Contractor","s":"QC","y":2023,"r":4455000,"e":529000,"m":3.02},{"n":238110,"d":"Concrete Contractor","s":"FL","y":2023,"r":6528562,"e":1203737,"m":2.82},{"n":561730,"d":"Landscaping Services","s":"HI","y":2023,"r":9755559,"e":394281,"m":10.4},{"n":237110,"d":"Specialty Utility Contractor, Specializing in Underground Piping, Specifically W","s":"NC","y":2023,"r":2972227,"e":480896,"m":1.72},{"n":238220,"d":"Residential and Commercial Plumber","s":"FL","y":2023,"r":1562486,"e":629195,"m":4.29},{"n":561730,"d":"Landscaping Company","s":"FL","y":2023,"r":339515,"e":98272,"m":2.23},{"n":238220,"d":"Plumbing Company","s":"FL","y":2023,"r":1563793,"e":364110,"m":2.33},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2023,"r":1340994,"e":278050,"m":3.06},{"n":238210,"d":"Security Systems Contractor","s":"CA","y":2023,"r":1013187,"e":305800,"m":1.62},{"n":238210,"d":"Electrical and Specialty Contractor Providing Energy Management System Installat","s":"LA","y":2023,"r":999000,"e":277307,"m":2.16},{"n":238990,"d":"Pools Remodeling Services","s":"FL","y":2023,"r":1104528,"e":249298,"m":2.81},{"n":238220,"d":"Residential Water Purification Business Offering Installation and Maintenance","s":"FL","y":2023,"r":896165,"e":234937,"m":2.53},{"n":238110,"d":"Residential and Commercial Concrete Repair and Installation","s":"CA","y":2023,"r":552712,"e":148174,"m":1.69},{"n":561730,"d":"Landscape Design and Services","s":"CO","y":2023,"r":1118480,"e":266817,"m":0.76},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"FL","y":2023,"r":585500,"e":77000,"m":3.9},{"n":238220,"d":"Services and Supplies Refrigerants for Large Companies with Chillers","s":"FL","y":2023,"r":1742427,"e":536428,"m":4.94},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (90% residential, 1","s":"FL","y":2023,"r":1275317,"e":56177,"m":4.01},{"n":561730,"d":"Residential Landscaping Company","s":"FL","y":2023,"r":685490,"e":100867,"m":3.08},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (50% residential, 5","s":"FL","y":2023,"r":769312,"e":176494,"m":3.12},{"n":238210,"d":"Electrical Contracting Business","s":"NY","y":2023,"r":3812178,"e":1282438,"m":2.81},{"n":561730,"d":"Commercial Landscaping Company","s":"FL","y":2023,"r":244061,"e":89681,"m":1.67},{"n":238290,"d":"Sells, Installs and Services Industrial Doors, Dock Equipment and Material Lifts","s":"WA","y":2023,"r":11818258,"e":2978614,"m":3.26},{"n":238160,"d":"Residential and Commercial Roofing Contractor","s":"FL","y":2023,"r":1684991,"e":330463,"m":1.82},{"n":238320,"d":"Painting Contractor","s":"FL","y":2023,"r":661264,"e":209575,"m":2.1},{"n":561730,"d":"Residential Lawn and Landscape Maintenance","s":"CO","y":2023,"r":461088,"e":140205,"m":1.6},{"n":238210,"d":"Residential Electrical Contractor","s":"FL","y":2023,"r":1323562,"e":484211,"m":1.96},{"n":238990,"d":"Fencing and Carpentry Contractor and with Retail Outdoor Power Equipment Store a","s":"ID","y":2023,"r":2884782,"e":712178,"m":2.18},{"n":238210,"d":"Residential Electrical Contractor","s":"FL","y":2023,"r":2662412,"e":412260,"m":2.85},{"n":238320,"d":"Painting Contractor","s":"FL","y":2023,"r":287292,"e":99544,"m":0.45},{"n":332322,"d":"Fabricates and Sells Heating and Air-Conditioning Ducts and Accessories","s":"ID","y":2023,"r":2000000,"e":509244,"m":2.16},{"n":238910,"d":"Land Clearing Service","s":"TX","y":2023,"r":1017889,"e":402736,"m":3.48},{"n":561730,"d":"Commercial Landscape Services","s":"HI","y":2023,"r":10135003,"e":871273,"m":5.74},{"n":238210,"d":"Electrical Company Serving Residential, Commercial, and Industrial Clients","s":"PA","y":2022,"r":2075138,"e":524930,"m":2.86},{"n":423310,"d":"Wholesaler of Dimensional Lumber, Rough-Cut Cedar, I Joists, Glu-Lams, and Build","s":"OK","y":2022,"r":48505983,"e":1857055,"m":7.97},{"n":561730,"d":"Commercial Landscaping and Snow Removal Franchise Company","s":"MA","y":2022,"r":1934020,"e":374238,"m":2.23},{"n":238210,"d":"Solar Contracting Company","s":"FL","y":2022,"r":8139200,"e":513100,"m":3.51},{"n":238150,"d":"Glazing Contractor and Aluminum Fabricator","s":"MI","y":2022,"r":2053262,"e":499725,"m":1.72},{"n":238210,"d":"Residential Electrical Contractor","s":"FL","y":2022,"r":6317135,"e":1069818,"m":2.02},{"n":238220,"d":"Commercial Only Air Conditioning Business","s":"FL","y":2022,"r":1191461,"e":321905,"m":2.33},{"n":238210,"d":"State Certified Solar Contracting Company","s":"FL","y":2022,"r":8425591,"e":513100,"m":3.25},{"n":238150,"d":"Residential Glass Replacement and Repair","s":"FL","y":2022,"r":667273,"e":228797,"m":2.08},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2022,"r":744814,"e":91015,"m":2.91},{"n":238990,"d":"Underground Utility Contractor Specialized in Wet Taps, Line Stops, Insert Valve","s":"FL","y":2022,"r":5832478,"e":1239295,"m":3.92},{"n":238220,"d":"Plumbing Services","s":"IL","y":2022,"r":1159805,"e":172000,"m":3.92},{"n":561730,"d":"Residential Landscaping Company","s":"FL","y":2022,"r":96456,"e":46456,"m":1.08},{"n":484110,"d":"Construction Materials Hauling Company","s":"FL","y":2022,"r":4501410,"e":928851,"m":3.55},{"n":562991,"d":"Residential Septic Systems Contractor Specializing in Pump Outs","s":"FL","y":2022,"r":657763,"e":156045,"m":1.6},{"n":561730,"d":"Residential and Commercial Landscaping Business","s":"TX","y":2022,"r":285209,"e":62288,"m":2.58},{"n":238290,"d":"Overhead Door Company (60% commercial, 40% residential)","s":"UT","y":2022,"r":3692716,"e":911280,"m":2.09},{"n":238350,"d":"Commercial Doors Contractor","s":"CA","y":2022,"r":13378043,"e":2861570,"m":4.09},{"n":444180,"d":"Plumbing Supply Business","s":"FL","y":2022,"r":385916,"e":112967,"m":1.33},{"n":238990,"d":"Contractor of Home Automation Technology (Smart Technology)","s":"ON","y":2022,"r":2895156,"e":668158,"m":2.88},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2022,"r":339421,"e":88293,"m":1.93},{"n":238220,"d":"Full-Service Plumbing Business","s":"FL","y":2022,"r":287130,"e":134095,"m":2.39},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"FL","y":2022,"r":647761,"e":136646,"m":2.2},{"n":236210,"d":"General Contractor for the Commercial and Industrial Markets","s":"QC","y":2022,"r":3671406,"e":685666,"m":1.71},{"n":238220,"d":"Residential, Commercial, and Industrial Plumbing Contractor (Home-Based Business","s":"CO","y":2022,"r":393626,"e":161679,"m":0.56},{"n":238990,"d":"Sewer Optic Inspections, Cleaning and Repair","s":"MN","y":2022,"r":374034,"e":245418,"m":2.44},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"UT","y":2022,"r":17369481,"e":3007473,"m":2.99},{"n":561730,"d":"Commercial and Residential Landscaping Company","s":"FL","y":2022,"r":449856,"e":173833,"m":2.93},{"n":236118,"d":"Handyman Service","s":"OH","y":2022,"r":1118331,"e":282191,"m":1.42},{"n":238220,"d":"Plumbing and Air Conditioning Business","s":"FL","y":2022,"r":604188,"e":45892,"m":3.81},{"n":238220,"d":"Plumbing Contractor (30% commercial, 70% residential)","s":"FL","y":2022,"r":1039882,"e":140432,"m":3.92},{"n":332322,"d":"Custom Sheet Metal Manufacturing and Fabrication of Various Metal Products","s":"ID","y":2022,"r":2293881,"e":526852,"m":3.99},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2022,"r":5975209,"e":970000,"m":3.7},{"n":236118,"d":"Residential Remodelers","s":"KY","y":2022,"r":1774398,"e":441434,"m":2.27},{"n":561730,"d":"Landscaping Services","s":"NS","y":2022,"r":1972952,"e":320405,"m":2.03},{"n":449129,"d":"Provides Custom Framing Designs, Prints, and Posters","s":"CA","y":2022,"r":491305,"e":105698,"m":2.6},{"n":238220,"d":"Residential and Commercial Heating, Ventilation, and Air Conditioning (HVAC) and","s":"MI","y":2022,"r":4449340,"e":476115,"m":1.53},{"n":238330,"d":"Commercial and Residential Floor Covering Seller and Installer","s":"PA","y":2022,"r":5721224,"e":894000,"m":2.91},{"n":238210,"d":"Commercial Low Voltage Technology Company","s":"IL","y":2022,"r":730000,"e":100000,"m":3.49},{"n":238210,"d":"Operates as a C-10 Electrical Contractor (40% Residential, 40% Commercial, and 2","s":"CA","y":2022,"r":979631,"e":429593,"m":1.07},{"n":561730,"d":"Commercial and Residential Landscaping Company","s":"FL","y":2022,"r":9861075,"e":1460622,"m":2.6},{"n":238320,"d":"Painting Contractor","s":"CO","y":2022,"r":510700,"e":147920,"m":1.69},{"n":238220,"d":"HVAC Company (95% residential, 5% commercial)","s":"TX","y":2022,"r":557589,"e":131739,"m":1.66},{"n":238220,"d":"Residential Water Purification Business","s":"FL","y":2022,"r":420860,"e":118485,"m":2.11},{"n":236118,"d":"Property Management Handyman Services","s":"NC","y":2022,"r":958072,"e":351887,"m":2.7},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (95% residential, 5","s":"FL","y":2022,"r":2646140,"e":556332,"m":4.22},{"n":238150,"d":"Window and Door Sales and Installation","s":"FL","y":2022,"r":2008412,"e":620479,"m":1.37},{"n":238220,"d":"Lawn Irrigation Business","s":"FL","y":2022,"r":1192783,"e":432588,"m":2.2},{"n":238220,"d":"Commercial Heating, Ventilation, and Air Conditioning (HVAC) Contractor Franchis","s":"TX","y":2022,"r":1500000,"e":310000,"m":2.56},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (75% residential, 2","s":"FL","y":2022,"r":2317097,"e":564593,"m":3.9},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"FL","y":2022,"r":407586,"e":118497,"m":1.35},{"n":238110,"d":"Concrete Contractor","s":"FL","y":2022,"r":4855683,"e":375212,"m":2.67},{"n":238150,"d":"Glass and Mirror Company","s":"FL","y":2022,"r":240417,"e":65253,"m":1.84},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2022,"r":756496,"e":157016,"m":1.66},{"n":238390,"d":"Concrete Coating Business","s":"FL","y":2022,"r":4330255,"e":316646,"m":6.79},{"n":561730,"d":"Commercial and Residential Landscaping Company","s":"FL","y":2022,"r":50000,"e":35000,"m":1.17},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2022,"r":6119875,"e":2253492,"m":3.33},{"n":561730,"d":"Commercial Lawn and Landscape Maintenance","s":"CO","y":2022,"r":1166338,"e":337620,"m":2.22},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (95% residential, 5","s":"FL","y":2022,"r":1625197,"e":191558,"m":3.13},{"n":238220,"d":"Residential Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"FL","y":2022,"r":300608,"e":109299,"m":2.29},{"n":444180,"d":"Retail and Distribution Business Supplying Windows and Doors to Contractors and ","s":"FL","y":2022,"r":258852,"e":85622,"m":1.05},{"n":332322,"d":"Fabricator of Sheet Metal, Primarily Stainless Steel and Aluminum, for Commercia","s":"MA","y":2022,"r":3303577,"e":496238,"m":4.6},{"n":444110,"d":"Home Improvement Center","s":"ON","y":2022,"r":3700000,"e":505000,"m":2.48},{"n":561730,"d":"Residential Landscaping Company","s":"FL","y":2022,"r":490218,"e":170721,"m":2.05},{"n":238990,"d":"Fencing Contractor","s":"FL","y":2022,"r":1645168,"e":229259,"m":1.22},{"n":238310,"d":"Commercial and Residential Drywall Installation and Repair","s":"IA","y":2022,"r":5257632,"e":1186444,"m":2.53},{"n":561730,"d":"Residential Landscaping Company","s":"FL","y":2022,"r":167287,"e":96554,"m":1.19},{"n":238220,"d":"Residential and Commercial Plumbing Contractor","s":"CA","y":2022,"r":4647055,"e":842887,"m":2.14},{"n":337126,"d":"Industrial Carpentry Specialized in Custom Home and Office Furniture and Design,","s":"FL","y":2022,"r":513971,"e":50511,"m":4.75},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (85% residential, 1","s":"FL","y":2022,"r":1356703,"e":269372,"m":3.25},{"n":561730,"d":"Commercial and Residential Landscaping Company","s":"FL","y":2022,"r":100000,"e":36000,"m":2.36},{"n":238330,"d":"Garage Flooring and Cabinet Installer Franchise","s":"FL","y":2022,"r":1688616,"e":500043,"m":0.53},{"n":238990,"d":"Fire Sprinkler Installation and Maintenance Company","s":"CO","y":2022,"r":3012826,"e":743183,"m":2.02},{"n":238220,"d":"Sprinkler Repair and Irrigation Company","s":"FL","y":2022,"r":402212,"e":162772,"m":0.98},{"n":238990,"d":"Commercial Fencing Company","s":"FL","y":2022,"r":4184594,"e":791059,"m":3.79},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"OK","y":2022,"r":1476522,"e":238241,"m":2.52},{"n":238110,"d":"Concrete Coating Company (Home-Based Business)","s":"GA","y":2022,"r":306269,"e":71262,"m":2.18},{"n":321113,"d":"Wood Transformation that includes Lumber Drying and Planing","s":"QC","y":2022,"r":4830282,"e":1692000,"m":1.97},{"n":444230,"d":"Lawn Mower and Commercial Landscaping Equipment Dealer","s":"FL","y":2022,"r":3644797,"e":601173,"m":2.4},{"n":561730,"d":"Commercial Landscaping Company","s":"FL","y":2022,"r":1362416,"e":434499,"m":2.77},{"n":238290,"d":"Elevator Sales and Service","s":"QC","y":2022,"r":20945000,"e":3650000,"m":3.97},{"n":561730,"d":"Commercial and Residential Landscaping Company","s":"FL","y":2022,"r":499861,"e":142593,"m":1.66},{"n":332322,"d":"Sheet Metal Work Manufacturing","s":"CA","y":2022,"r":32800000,"e":6635000,"m":5.12},{"n":238350,"d":"Window and Door Contractor","s":"MA","y":2022,"r":769758,"e":94326,"m":1.5},{"n":321215,"d":"Roofing Truss Manufacturer","s":"UT","y":2022,"r":22057651,"e":8132971,"m":2.26},{"n":238330,"d":"Wood Refinishing Franchise","s":"CO","y":2022,"r":1042626,"e":236245,"m":1.48},{"n":238210,"d":"Electrical Contractor","s":"OR","y":2022,"r":1984236,"e":205180,"m":4.63},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"FL","y":2022,"r":5276283,"e":532990,"m":5.63},{"n":238910,"d":"Performs Heavy Equipment Site Preparation, Excavation, and Land Clearing","s":"TX","y":2022,"r":6485161,"e":185808,"m":8.07},{"n":561730,"d":"Residential Landscaping Company","s":"FL","y":2022,"r":140163,"e":69130,"m":1.58},{"n":561730,"d":"Commercial Landscaping Company","s":"FL","y":2022,"r":466840,"e":145000,"m":1.55},{"n":238990,"d":"Paving Contractor","s":"FL","y":2022,"r":572077,"e":207210,"m":1.93},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (100% Commercial)","s":"CA","y":2022,"r":2004639,"e":525064,"m":3.42},{"n":238150,"d":"Window and Door Sales and Installation","s":"FL","y":2022,"r":382585,"e":119659,"m":1.0},{"n":238220,"d":"Residential Water Conditioning Business","s":"FL","y":2022,"r":2378465,"e":1290012,"m":4.46},{"n":238170,"d":"Residential Gutters, Downspouts, and Awnings Installation","s":"NY","y":2022,"r":985000,"e":223385,"m":2.37},{"n":238170,"d":"Gutter and Downspout Contractor","s":"WI","y":2022,"r":564268,"e":166423,"m":1.68},{"n":238160,"d":"Residential and Commercial Roofing Contractor","s":"FL","y":2022,"r":5189524,"e":1131362,"m":2.21},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2022,"r":2357050,"e":764497,"m":1.83},{"n":449129,"d":"Art Framing Services","s":"FL","y":2022,"r":450425,"e":181982,"m":1.74},{"n":238990,"d":"Installer of Wire Guidance Systems in Warehouses","s":"FL","y":2022,"r":745033,"e":206697,"m":2.66},{"n":561730,"d":"Commercial Landscaping Company","s":"FL","y":2022,"r":2719796,"e":995952,"m":0.95},{"n":238990,"d":"Garage Door Services","s":"WA","y":2022,"r":3217746,"e":585326,"m":8.71},{"n":238210,"d":"Electrical Contractor","s":"","y":2022,"r":32000000,"e":2200000,"m":2.5},{"n":238990,"d":"Gas Station Repair and Maintenance Business","s":"TX","y":2022,"r":4331203,"e":353992,"m":4.52},{"n":238990,"d":"Fence Construction and Installation Company","s":"PA","y":2022,"r":7612483,"e":674799,"m":2.96},{"n":561730,"d":"Landscaping and Snow Removal Service for Commercial Clients","s":"MA","y":2022,"r":1570620,"e":322808,"m":2.59},{"n":236118,"d":"Interior Demolition and Interior Renovation Company","s":"FL","y":2022,"r":1489220,"e":171166,"m":2.63},{"n":238220,"d":"Sewer, Drain, and Septic Services","s":"MN","y":2022,"r":1082752,"e":538163,"m":3.34},{"n":238290,"d":"Commercial Garage Door Installer","s":"BC","y":2022,"r":3124116,"e":413622,"m":4.41},{"n":541320,"d":"Residential and Commercial Full-Service Landscape Construction and Maintenance","s":"AB","y":2022,"r":301544,"e":123746,"m":1.98},{"n":238990,"d":"Engaged in Waterproofing and Stone Care Services","s":"CA","y":2022,"r":13884372,"e":1679021,"m":3.22},{"n":238160,"d":"Residential and Commercial Roofing Contractor","s":"FL","y":2022,"r":25260255,"e":4857358,"m":2.68},{"n":541350,"d":"Construction Materials Testing and Construction Site Inspection Company","s":"CO","y":2022,"r":1484471,"e":259816,"m":2.16},{"n":238160,"d":"Roofing Contractor","s":"NC","y":2022,"r":10300000,"e":1300000,"m":2.96},{"n":238220,"d":"Residential and Commercial HVAC Company (Home-Based Business)","s":"OR","y":2022,"r":648503,"e":245351,"m":2.85},{"n":561730,"d":"Residential Landscaping Company","s":"FL","y":2022,"r":1015550,"e":439390,"m":1.82},{"n":238990,"d":"Garage Organization Franchise Business (Home-Based Business)","s":"FL","y":2022,"r":362799,"e":204360,"m":1.16},{"n":236220,"d":"Provide Commercial and Industrial Renovation Services","s":"AL","y":2022,"r":3374000,"e":400000,"m":3.13},{"n":238220,"d":"HVAC and Plumbing Contractor (65% HVAC, 35% plumbing; 95% residential, 5% commer","s":"FL","y":2022,"r":2335962,"e":392631,"m":3.57},{"n":238330,"d":"Epoxy Flooring Installation Contractor","s":"FL","y":2022,"r":314190,"e":164681,"m":1.45},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (95% residential, 5","s":"FL","y":2022,"r":4181744,"e":253559,"m":4.34},{"n":238220,"d":"Plumbing Contractor (80% residential, 20% commercial)","s":"FL","y":2022,"r":812600,"e":261437,"m":1.26},{"n":238220,"d":"Commercial and Residential Plumbing and Heating Company","s":"MA","y":2022,"r":1071231,"e":142085,"m":4.43},{"n":238220,"d":"Plumbing Business","s":"MO","y":2022,"r":1418094,"e":424645,"m":1.62},{"n":238990,"d":"Pool Sales, Installs, Service and Repair, and Cleaning and Maintenance","s":"FL","y":2022,"r":4011787,"e":587107,"m":2.2},{"n":561730,"d":"Commercial Landscaping Company","s":"FL","y":2022,"r":495038,"e":142212,"m":2.57},{"n":237110,"d":"Water and Sewer Contractor","s":"FL","y":2022,"r":2818789,"e":615046,"m":3.58},{"n":238160,"d":"Roofing Contractor","s":"MA","y":2022,"r":2099468,"e":439956,"m":1.52},{"n":423810,"d":"Distributor of Power Tools, Equipment, and Supplies to the Construction Industry","s":"MN","y":2022,"r":8091288,"e":709891,"m":11.27},{"n":238990,"d":"Handyman Service","s":"FL","y":2022,"r":719245,"e":189210,"m":1.54},{"n":541310,"d":"Construction Design Businesses","s":"NE","y":2022,"r":771602,"e":536007,"m":2.24},{"n":238990,"d":"Radon Mitigation Company (Home-Based Business)","s":"CO","y":2022,"r":587505,"e":132478,"m":2.49},{"n":561621,"d":"Security Systems Contractor","s":"KS","y":2022,"r":966200,"e":304807,"m":2.38},{"n":561730,"d":"Landscape Maintenance","s":"CA","y":2022,"r":1884917,"e":428077,"m":3.04},{"n":561730,"d":"Commercial Lawn and Landscape Maintenance","s":"FL","y":2022,"r":3022694,"e":497962,"m":3.46},{"n":561730,"d":"Commercial Landscaping Company","s":"FL","y":2022,"r":3022694,"e":497962,"m":3.46},{"n":238320,"d":"Painting Company","s":"BC","y":2022,"r":853946,"e":349272,"m":1.15},{"n":561730,"d":"Landscape, Hardscape, and Snow Plow Business (residential 30%, commercial 70%)","s":"PA","y":2022,"r":2650562,"e":290732,"m":3.94},{"n":236220,"d":"Barn Construction Company (Home-Based Business)","s":"MI","y":2022,"r":415283,"e":42500,"m":1.24},{"n":561730,"d":"Residential Landscaping Company","s":"FL","y":2022,"r":500310,"e":169732,"m":2.06},{"n":541512,"d":"Government Contractor of Computer Design Support Services","s":"VA","y":2022,"r":957480,"e":367438,"m":1.89},{"n":238910,"d":"Construction Surface Preparation Contractor","s":"NJ","y":2022,"r":196093,"e":106066,"m":2.83},{"n":238990,"d":"Radon Mitigation Installation Company","s":"CO","y":2022,"r":1170228,"e":208232,"m":2.28},{"n":238220,"d":"Plumbing Business","s":"UT","y":2022,"r":348019,"e":161710,"m":0.53},{"n":238210,"d":"Electrical Contractor","s":"AK","y":2022,"r":4300409,"e":926488,"m":2.64},{"n":238220,"d":"Lawn Sprinkler Business","s":"FL","y":2022,"r":421397,"e":104914,"m":2.38},{"n":238220,"d":"Heating Ventilation and Commerical Air-Conditioning (HVAC)\u00a0Contractor","s":"FL","y":2022,"r":1025893,"e":185446,"m":0.78},{"n":238220,"d":"Plumbing, Heating, Ventilation, and Air Conditioning (HVAC), and Electrical Cont","s":"PA","y":2022,"r":6195306,"e":1113866,"m":2.78},{"n":238220,"d":"Heating Ventilation and Commerical Air-Conditioning (HVAC)\u00a0Contractor","s":"NJ","y":2022,"r":2182563,"e":1196804,"m":4.09},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"FL","y":2022,"r":2152976,"e":672171,"m":3.85},{"n":238160,"d":"Roofing Contractor","s":"NH","y":2022,"r":935748,"e":256647,"m":1.41},{"n":561730,"d":"Commercial and Residential Landscaping Company","s":"FL","y":2022,"r":510907,"e":214306,"m":1.56},{"n":238220,"d":"HVAC Contractor (85% residential, 15% commercial)","s":"FL","y":2022,"r":2147870,"e":606861,"m":4.26},{"n":238160,"d":"Roofing Contractor","s":"UT","y":2022,"r":1474510,"e":218879,"m":2.14},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"FL","y":2022,"r":1264482,"e":124316,"m":3.1},{"n":541350,"d":"Energy Efficiency Rating Company For New Home Builds (Home-Based Business)","s":"","y":2022,"r":1132285,"e":678138,"m":2.65},{"n":238110,"d":"Pool Resurfacing Company","s":"FL","y":2022,"r":216529,"e":96479,"m":3.1},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (50% residential, 5","s":"FL","y":2022,"r":513605,"e":183128,"m":0.41},{"n":561730,"d":"Residential Landscaping Company","s":"FL","y":2022,"r":363815,"e":142836,"m":1.72},{"n":236118,"d":"Remodeling Company that Specializes in Remodeling Kitchens and Bathrooms","s":"NJ","y":2022,"r":3256874,"e":539026,"m":0.28},{"n":561730,"d":"Landscaping and Irrigation Business","s":"FL","y":2022,"r":2922451,"e":432823,"m":6.01},{"n":238150,"d":"Commercial Glazing Business","s":"CO","y":2022,"r":1714211,"e":209288,"m":3.34},{"n":561730,"d":"Commercial Landscaping Company","s":"FL","y":2022,"r":478689,"e":131009,"m":1.15},{"n":238220,"d":"Plumbing Contractor (95% residential new construction)","s":"FL","y":2022,"r":11333929,"e":1013900,"m":1.73},{"n":236118,"d":"Home Repairs and Remodeling Services Franchise","s":"VA","y":2022,"r":1100000,"e":223000,"m":2.88},{"n":238220,"d":"Plumbing Services","s":"AL","y":2022,"r":4000000,"e":777000,"m":5.47},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"VA","y":2022,"r":3122311,"e":317384,"m":4.1},{"n":236118,"d":"Bathroom Remodeling Franchise","s":"IL","y":2022,"r":1069996,"e":65090,"m":3.3},{"n":238220,"d":"Commercial Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"NJ","y":2022,"r":11071172,"e":1457364,"m":2.74},{"n":238120,"d":"Structural Steel Fabrication and Erection Contractor","s":"FL","y":2022,"r":12103579,"e":3913540,"m":0.89},{"n":238220,"d":"Residential Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"FL","y":2022,"r":5355946,"e":1120226,"m":3.93},{"n":449129,"d":"Art Framing Business","s":"TX","y":2022,"r":243913,"e":50841,"m":1.57},{"n":444180,"d":"Construction Materials Dealer","s":"OR","y":2022,"r":5025063,"e":633916,"m":4.34},{"n":238290,"d":"Overhead Door Company (50% commercial, 50% residential)","s":"MN","y":2022,"r":1708945,"e":366706,"m":0.71},{"n":561730,"d":"Commercial and Residential Landscaping Company","s":"FL","y":2022,"r":773875,"e":308042,"m":1.95},{"n":561621,"d":"Security Systems Contractor","s":"TX","y":2022,"r":270310,"e":101548,"m":1.05},{"n":238290,"d":"Pool Fence Business that Sells and Installs a Physical Layer of Protection Aroun","s":"FL","y":2022,"r":154401,"e":55750,"m":1.17},{"n":238210,"d":"Electrical Contractor (60% new construction/remodel, 40% ongoing service work)","s":"FL","y":2022,"r":1117834,"e":345494,"m":2.11},{"n":238160,"d":"Roofing Contractor","s":"GA","y":2022,"r":1242127,"e":323868,"m":0.37},{"n":238990,"d":"Asphalt Paving Contractor","s":"CO","y":2022,"r":1902610,"e":459510,"m":3.59},{"n":238350,"d":"Contractor Windows and Doors","s":"TX","y":2022,"r":5328183,"e":1037046,"m":3.15},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2022,"r":4069094,"e":454599,"m":2.09},{"n":238990,"d":"Builds, Repairs, and Services Swimming Pools","s":"FL","y":2022,"r":4408277,"e":1011991,"m":1.88},{"n":237110,"d":"Underground Utility Construction Contractor","s":"MO","y":2022,"r":6505846,"e":1274496,"m":4.12},{"n":238160,"d":"Roofing, HVAC, and Sheet Metal Contractor","s":"Ontario","y":2022,"r":9545899,"e":1221581,"m":5.65},{"n":238210,"d":"Electrical Contractor","s":"CO","y":2022,"r":1206656,"e":406822,"m":1.69},{"n":332311,"d":"Design/Construction Fabricator of Exterior Structures","s":"FL","y":2022,"r":8469317,"e":2002018,"m":5.14},{"n":449129,"d":"Art Framing Business","s":"CO","y":2022,"r":422135,"e":132285,"m":1.39},{"n":332322,"d":"Sheet Metal Fabrication","s":"CA","y":2022,"r":4444492,"e":2173237,"m":2.76},{"n":238310,"d":"Subcontractor Dry Wall Company","s":"FL","y":2022,"r":1792457,"e":262592,"m":1.05},{"n":238210,"d":"Residential Electrical Contractor","s":"FL","y":2022,"r":3509373,"e":995902,"m":3.92},{"n":238150,"d":"Residential Glass Window Restore, Repair, and Replace Franchise","s":"CO","y":2022,"r":1078146,"e":193209,"m":1.73},{"n":561990,"d":"Provides Traffic Control Services to the Construction Sector","s":"ID","y":2022,"r":2928727,"e":740926,"m":2.16},{"n":449129,"d":"Art Framing","s":"WA","y":2022,"r":286536,"e":73990,"m":1.64},{"n":238110,"d":"Specialty Concrete Contractor","s":"OR","y":2022,"r":900000,"e":292306,"m":2.57},{"n":561730,"d":"Residential Landscaping Company","s":"FL","y":2022,"r":205417,"e":114810,"m":1.61},{"n":238910,"d":"Excavation Company","s":"CO","y":2022,"r":885688,"e":368509,"m":2.17},{"n":561730,"d":"Landscape Company","s":"MA","y":2022,"r":1133759,"e":157243,"m":2.23},{"n":444180,"d":"Building Material Supplier","s":"FL","y":2022,"r":3247264,"e":259232,"m":2.5},{"n":561730,"d":"Commercial Lawn and Landscape Company","s":"NC","y":2022,"r":964688,"e":303406,"m":2.64},{"n":238220,"d":"Commercial HVAC Company","s":"AL","y":2022,"r":705000,"e":50000,"m":6.0},{"n":238210,"d":"Solar System Contractor","s":"AR","y":2022,"r":1837622,"e":239500,"m":3.44},{"n":236118,"d":"Residential Contractor","s":"FL","y":2022,"r":7560936,"e":1278003,"m":3.21},{"n":238220,"d":"HVAC, Plumbing, and Electrical Contractor","s":"FL","y":2022,"r":4260724,"e":729595,"m":3.96},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2022,"r":1772666,"e":239416,"m":3.55},{"n":238130,"d":"High-End Custom Framing Contractor","s":"TX","y":2022,"r":518263,"e":313586,"m":2.0},{"n":238390,"d":"Contractor of Office Partitions","s":"OR","y":2022,"r":832300,"e":223256,"m":1.55},{"n":238320,"d":"Painting and Power Washing Business","s":"FL","y":2022,"r":323745,"e":187072,"m":0.8},{"n":238350,"d":"Window Sales and Installation Firm (Home-Based Business)","s":"NC","y":2022,"r":809855,"e":178715,"m":2.1},{"n":238210,"d":"Low Voltage Wiring Installation Contractor","s":"TX","y":2022,"r":1453195,"e":336182,"m":1.64},{"n":238220,"d":"Glass Repair And Tinting Company","s":"","y":2022,"r":3676081,"e":630465,"m":3.36},{"n":238990,"d":"Fencing Contractor","s":"KY","y":2022,"r":2773484,"e":769567,"m":1.56},{"n":561730,"d":"Residential and Commercial Landscaping and Hardscaping","s":"NY","y":2022,"r":1468014,"e":154781,"m":2.49},{"n":238220,"d":"Residential Plumbing Contractor","s":"FL","y":2022,"r":1852788,"e":265332,"m":2.68},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2022,"r":2693498,"e":690886,"m":2.61},{"n":238220,"d":"Residential HVAC and Plumbing Contractor","s":"FL","y":2022,"r":2107481,"e":402636,"m":3.73},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2022,"r":1034834,"e":347213,"m":2.16},{"n":238990,"d":"Fence Contractor (75% residential, 25% commercial)","s":"FL","y":2022,"r":2065374,"e":586320,"m":1.92},{"n":238220,"d":"Sales and Installation of In-Home Water Filtration Systems","s":"TX","y":2022,"r":1413524,"e":615520,"m":3.66},{"n":238220,"d":"HVAC Contractor (50% residential, 50% commercial)","s":"FL","y":2022,"r":3887638,"e":704349,"m":3.83},{"n":237990,"d":"Marine Construction Contractor","s":"FL","y":2022,"r":998776,"e":210165,"m":2.38},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2022,"r":535383,"e":147150,"m":1.29},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2022,"r":535384,"e":147150,"m":1.29},{"n":561730,"d":"Landscape Design, Install, Maintenance","s":"NC","y":2022,"r":5898061,"e":906829,"m":4.96},{"n":238220,"d":"Plumbing Contractor (60% commercial, 40% residential)","s":"FL","y":2022,"r":4156606,"e":1136002,"m":3.7},{"n":238220,"d":"Plumbing Contractor","s":"CO","y":2022,"r":1229834,"e":175950,"m":1.99},{"n":238220,"d":"Residential Plumbing Contractor","s":"FL","y":2022,"r":378619,"e":157007,"m":1.88},{"n":561730,"d":"Residential Landscaping Business","s":"FL","y":2022,"r":139506,"e":53712,"m":1.53},{"n":238210,"d":"Security Systems Installation Business","s":"CO","y":2022,"r":4264456,"e":432071,"m":1.16},{"n":238210,"d":"Commercial and Industrial Electrical Contractor","s":"OK","y":2022,"r":1350957,"e":212750,"m":1.88},{"n":238220,"d":"HVAC Contractor (70% residential, 30% commercial)","s":"FL","y":2022,"r":1781172,"e":198210,"m":3.03},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2022,"r":1143174,"e":187812,"m":2.8},{"n":238290,"d":"Provider of Confined Space Entry, Plant Maintenance Support, and Safety Services","s":"AB","y":2022,"r":6214763,"e":1102760,"m":6.35},{"n":238220,"d":"Irrigation/Sprinkler Company","s":"FL","y":2022,"r":323443,"e":155868,"m":2.09},{"n":238220,"d":"Commercial Air Conditioning Installation and Maintenance Services","s":"QLD","y":2022,"r":469284,"e":127417,"m":1.33},{"n":561730,"d":"Commercial Landscaping","s":"CA","y":2022,"r":2508136,"e":509335,"m":2.36},{"n":561730,"d":"Landscaping Services","s":"HI","y":2022,"r":8492171,"e":646538,"m":8.04},{"n":238320,"d":"Painting Contractor","s":"CA","y":2022,"r":385257,"e":103165,"m":0.58},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"FL","y":2022,"r":657291,"e":113171,"m":1.77},{"n":332999,"d":"Precision Sheet Metal Fabrication","s":"CA","y":2022,"r":1866161,"e":387897,"m":2.58},{"n":238220,"d":"Residential Heating, Ventilation, and Air Conditioning (HVAC) Company","s":"TX","y":2022,"r":631797,"e":171279,"m":2.34},{"n":444180,"d":"Building Material Dealer","s":"","y":2022,"r":10439461,"e":1763335,"m":5.95},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) and Plumbing Mechanical Servic","s":"ON","y":2022,"r":3006600,"e":870000,"m":3.45},{"n":444240,"d":"Nursery that also offers Landscape Design  and Installation","s":"FL","y":2022,"r":2307008,"e":727576,"m":2.89},{"n":238220,"d":"Commercial Plumbing and Piping Contractor","s":"CA","y":2022,"r":10533479,"e":1978157,"m":2.96},{"n":237110,"d":"Underground Wet Utility Installation and Repair Company","s":"CO","y":2022,"r":8757863,"e":847521,"m":5.6},{"n":238910,"d":"Site Preparation","s":"FL","y":2022,"r":1339047,"e":460327,"m":1.58},{"n":922160,"d":"Commercial Fire Protection","s":"PA","y":2022,"r":19870000,"e":2483000,"m":8.05},{"n":561730,"d":"Landscaping Company","s":"UT","y":2022,"r":1774961,"e":309018,"m":1.94},{"n":238990,"d":"Fireplace Contractor","s":"ID","y":2022,"r":3413523,"e":994808,"m":2.3},{"n":238210,"d":"Residential and Commercial Electrical Contractor","s":"CO","y":2022,"r":315799,"e":148765,"m":2.02},{"n":238220,"d":"Residential and Commercial HVAC Contractor","s":"FL","y":2022,"r":900000,"e":305000,"m":1.84},{"n":238210,"d":"Hidden Dog Fence Company","s":"TX","y":2022,"r":375000,"e":160000,"m":2.19},{"n":237110,"d":"Well Drilling Contractor","s":"NC","y":2022,"r":595811,"e":165054,"m":2.64},{"n":561730,"d":"Lawn/Landscaping / Lawn Maintenance & Service, Lawn/Landscaping / Snow Removal -","s":"MN","y":2022,"r":679545,"e":433335,"m":1.44},{"n":237120,"d":"Oil and Gas Pipeline Construction","s":"OK","y":2022,"r":16949352,"e":3000669,"m":2.74},{"n":238220,"d":"Heating and Plumbing Business","s":"CO","y":2022,"r":1274101,"e":145471,"m":3.0},{"n":561730,"d":"Residential Landscape Design and Installation","s":"KS","y":2022,"r":948327,"e":218169,"m":3.87},{"n":238170,"d":"Aluminum Gutter Installation Company","s":"FL","y":2022,"r":74132,"e":47548,"m":0.63},{"n":561730,"d":"Commercial Lawn and Landscaping Company","s":"GA","y":2022,"r":220000,"e":101000,"m":0.77},{"n":423310,"d":"Wholesale Wood Flooring and Tile Supply Distributor to Construction Contractors","s":"OR","y":2022,"r":1007208,"e":407080,"m":1.47},{"n":238210,"d":"Provides Custom Audio Video Integration and Security Alarm Installation Services","s":"FL","y":2022,"r":793649,"e":191935,"m":2.68},{"n":561730,"d":"Lawn Care and Landscaping Business (25% commercial, 75% residential)","s":"FL","y":2022,"r":214565,"e":93068,"m":1.7},{"n":238220,"d":"Provides Gas Fireplace, Heating and Plumbing Product Sales, Installation, Repair","s":"CA","y":2022,"r":969443,"e":254014,"m":1.08},{"n":561730,"d":"Commercial and Residential Landscaping Company","s":"KY","y":2022,"r":4276410,"e":433268,"m":3.92},{"n":238150,"d":"Commercial Window and Door Business","s":"FL","y":2022,"r":1144936,"e":155736,"m":2.05},{"n":238990,"d":"Swimming Pool Restoration Service","s":"FL","y":2022,"r":3735384,"e":541254,"m":3.7},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2022,"r":5546988,"e":938765,"m":3.73},{"n":238220,"d":"Plumbing and HVAC Company","s":"NV","y":2022,"r":3642173,"e":461822,"m":3.44},{"n":238310,"d":"Insulation Contractor","s":"PA","y":2022,"r":1556538,"e":180871,"m":3.32},{"n":561730,"d":"Landscaping, Pest Control, and Fertilization Company","s":"FL","y":2022,"r":744361,"e":272005,"m":3.64},{"n":541350,"d":"Construction Inspection Company (home-based business)","s":"PA","y":2022,"r":416456,"e":221904,"m":2.22},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning Contractor","s":"NJ","y":2022,"r":13209470,"e":2461500,"m":6.91},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning Contractor","s":"NJ","y":2022,"r":1921343,"e":620404,"m":2.9},{"n":561730,"d":"Landscape, Pest control, and Fertilization Company","s":"FL","y":2022,"r":913609,"e":389554,"m":2.54},{"n":238160,"d":"Residential and Commercial Roofing Contractor","s":"FL","y":2022,"r":3382001,"e":593370,"m":5.9},{"n":238220,"d":"HVAC Contractor (50% residential, 50% commercial)","s":"FL","y":2022,"r":1602648,"e":196471,"m":4.07},{"n":238220,"d":"HVAC Contractor (70% residential, 30% light commercial)","s":"FL","y":2022,"r":1020555,"e":502360,"m":1.89},{"n":238210,"d":"Electrical Contractor","s":"CO","y":2022,"r":3213380,"e":819807,"m":3.29},{"n":238150,"d":"Sale and Installation of Impact Windows and Doors for Residential Customers","s":"FL","y":2022,"r":24874875,"e":3065352,"m":2.61},{"n":561730,"d":"Lawn Maintenance and Landscape Company","s":"FL","y":2022,"r":776739,"e":274661,"m":3.51},{"n":238220,"d":"Commercial Plumbing Contractor","s":"FL","y":2022,"r":844452,"e":258179,"m":1.36},{"n":238320,"d":"Painting Contractor","s":"FL","y":2022,"r":576876,"e":120877,"m":2.42},{"n":238210,"d":"Commercial Electrical Contractor","s":"FL","y":2022,"r":4614367,"e":1702446,"m":1.41},{"n":238220,"d":"Residential Heating, Ventilation, and Air Conditioning (HVAC) Company (80% Resid","s":"NC","y":2022,"r":1275000,"e":296755,"m":1.94},{"n":238990,"d":"Contractor Pool","s":"FL","y":2022,"r":1932315,"e":235268,"m":2.76},{"n":238160,"d":"Commercial and Residential Roofing Company","s":"CA","y":2022,"r":3841817,"e":1410500,"m":2.4},{"n":238220,"d":"HVAC Company (80% residential, 20% commercial)","s":"FL","y":2022,"r":866040,"e":77607,"m":2.83},{"n":238220,"d":"Residential Heating, Ventilation, and Air Conditioning (HVAC) Company","s":"NC","y":2022,"r":285955,"e":91057,"m":2.0},{"n":449129,"d":"Art Framing","s":"TX","y":2022,"r":341556,"e":168598,"m":0.95},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2022,"r":1071897,"e":218208,"m":3.32},{"n":238990,"d":"Paving Contractor","s":"CO","y":2022,"r":5205948,"e":874603,"m":2.29},{"n":238310,"d":"Residential Drywall Contractor","s":"FL","y":2022,"r":4270036,"e":240883,"m":1.44},{"n":561730,"d":"Commercial and Multi-Unit Landscape Maintenance Company","s":"CO","y":2022,"r":587584,"e":177982,"m":2.53},{"n":423320,"d":"Supplier of Stone and Landscaping Materials","s":"NE","y":2022,"r":1047000,"e":423000,"m":3.12},{"n":238160,"d":"Roofing Contractor","s":"PA","y":2022,"r":996000,"e":350000,"m":2.14},{"n":238220,"d":"Residential Plumbing Contractor","s":"FL","y":2022,"r":645539,"e":148936,"m":2.62},{"n":561730,"d":"Landscaping Services","s":"NJ","y":2022,"r":129963,"e":21867,"m":0.91},{"n":561730,"d":"Commercial and Residential Landscaping Company","s":"FL","y":2022,"r":169000,"e":60000,"m":1.5},{"n":238210,"d":"Electrical Contractor","s":"VA","y":2022,"r":1006941,"e":158556,"m":2.52},{"n":238210,"d":"Electrical Contractor (50% residential, 50% commercial)","s":"TN","y":2022,"r":546000,"e":176000,"m":2.19},{"n":236220,"d":"Provides Customized Construction Products and Services Including Aggregate Hauli","s":"ON","y":2022,"r":3194535,"e":613534,"m":4.3},{"n":561730,"d":"Landscaping Services","s":"TX","y":2022,"r":350456,"e":125186,"m":2.29},{"n":238210,"d":"Engaged in Installing and Servicing Electrical Equipment (Home-Based Business)","s":"WA","y":2022,"r":524378,"e":140046,"m":1.25},{"n":238390,"d":"Residential Retrofitting and Foundation Repair","s":"CA","y":2022,"r":1913765,"e":953260,"m":2.31},{"n":541690,"d":"Construction Safety Consultancy","s":"FL","y":2022,"r":212637,"e":103437,"m":1.69},{"n":238990,"d":"Swimming Pool Construction Contractor","s":"FL","y":2022,"r":6080735,"e":810350,"m":3.46},{"n":238220,"d":"Residential and Commercial HVAC Contractor","s":"FL","y":2022,"r":2831834,"e":404184,"m":3.96},{"n":238990,"d":"Swimming Pool Repair Business (90% residential, 10% commercial)","s":"FL","y":2022,"r":1169351,"e":291399,"m":3.17},{"n":561730,"d":"Lawn Care and Landscaping Company","s":"FL","y":2022,"r":2694608,"e":708519,"m":4.23},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"TX","y":2022,"r":449972,"e":175200,"m":1.17},{"n":238990,"d":"Paving Contractor","s":"MT","y":2022,"r":1345738,"e":415833,"m":1.62},{"n":238330,"d":"Flooring Contractor","s":"NJ","y":2022,"r":510000,"e":125000,"m":2.8},{"n":238330,"d":"Flooring Restoration and Maintenance Company","s":"FL","y":2022,"r":1070515,"e":339929,"m":3.81},{"n":238150,"d":"Glass and Mirror Sales and Installation (90% retail/residential, 10% commercial)","s":"FL","y":2022,"r":770851,"e":268915,"m":1.95},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning Contractor","s":"OH","y":2022,"r":2275492,"e":420000,"m":3.1},{"n":561730,"d":"Tree Services and Landscaping Company","s":"FL","y":2022,"r":135329,"e":125170,"m":0.79},{"n":561730,"d":"Landscaping Services","s":"NJ","y":2022,"r":1269047,"e":456671,"m":2.19},{"n":238220,"d":"Commercial HVAC Contractor","s":"FL","y":2022,"r":370682,"e":42547,"m":3.94},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning Contractor","s":"TX","y":2022,"r":1158653,"e":244742,"m":2.45},{"n":561730,"d":"Tree Services and Landscape Business","s":"FL","y":2022,"r":790598,"e":276704,"m":2.62},{"n":561730,"d":"Commercial and Residential Lawn Care and Landscaping Business","s":"FL","y":2022,"r":149069,"e":52046,"m":1.73},{"n":238990,"d":"Sells, Installs, and Services Retractable Swimming Pool Covers","s":"UT","y":2022,"r":2000000,"e":500000,"m":2.2},{"n":236115,"d":"General Contractor","s":"FL","y":2022,"r":5671034,"e":632889,"m":2.37},{"n":238150,"d":"Glass Window Contractor","s":"MT","y":2022,"r":483600,"e":163716,"m":0.76},{"n":238990,"d":"Residential Window Rescreening Business","s":"FL","y":2022,"r":85944,"e":19845,"m":2.27},{"n":238110,"d":"Concrete Contractor","s":"AB","y":2022,"r":687010,"e":137063,"m":1.46},{"n":561730,"d":"Residential and Commercial Landscaping and Maintenance Business","s":"MA","y":2022,"r":2239778,"e":805099,"m":2.24},{"n":238990,"d":"Caulking and Waterproofing Business","s":"FL","y":2022,"r":675187,"e":139615,"m":1.72},{"n":238150,"d":"Glass Company","s":"FL","y":2022,"r":544050,"e":147258,"m":1.15},{"n":238210,"d":"Electrical Contractor","s":"CO","y":2022,"r":5191894,"e":662152,"m":3.81},{"n":238990,"d":"Caulking and Waterproofing Business","s":"FL","y":2022,"r":605006,"e":222804,"m":1.08},{"n":561730,"d":"Landscaping Services","s":"WA","y":2022,"r":484689,"e":87423,"m":1.66},{"n":561730,"d":"Commercial Lawn and Landscaping Company","s":"FL","y":2022,"r":3361653,"e":956212,"m":3.14},{"n":561730,"d":"Lawn Care and Landscaping Business","s":"FL","y":2022,"r":509282,"e":143501,"m":1.95},{"n":561730,"d":"Landscape Maintenance","s":"CA","y":2022,"r":2523764,"e":504857,"m":1.29},{"n":238910,"d":"Site Preparation","s":"FL","y":2022,"r":6341154,"e":2630242,"m":1.41},{"n":236117,"d":"New Homes Builder","s":"UT","y":2022,"r":1551118,"e":237460,"m":4.21},{"n":238220,"d":"HVAC Contractor (75% residential, 25% commercial)","s":"FL","y":2022,"r":4129136,"e":570519,"m":4.91},{"n":238160,"d":"Roofing Contractor","s":"ON","y":2022,"r":5552504,"e":713438,"m":2.52},{"n":561730,"d":"Lawn Care and Landscaping Business","s":"FL","y":2022,"r":117581,"e":64829,"m":0.76},{"n":238170,"d":"Gutters Contractor","s":"VA","y":2022,"r":1164420,"e":307986,"m":2.5},{"n":238210,"d":"Sells and Installs Solatube Tubular Daylighting Devices","s":"OR","y":2022,"r":600586,"e":94553,"m":2.12},{"n":238990,"d":"Synthetic Turf Installation Company","s":"TX","y":2022,"r":6534942,"e":1272355,"m":4.13},{"n":238150,"d":"Glass Company (70% residential, 30% commercial)","s":"FL","y":2022,"r":728511,"e":314113,"m":0.49},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2022,"r":4051045,"e":1501135,"m":2.0},{"n":238160,"d":"Roofing Contractor","s":"MD","y":2022,"r":5357694,"e":334891,"m":2.69},{"n":561730,"d":"Residential Landscaping Business","s":"OR","y":2022,"r":210870,"e":80415,"m":1.99},{"n":237990,"d":"Marine Construction Contractor","s":"FL","y":2022,"r":2109085,"e":258785,"m":1.33},{"n":238160,"d":"Roofing Contractor","s":"WA","y":2022,"r":340852,"e":156811,"m":1.47},{"n":238160,"d":"Roofing Company","s":"VA","y":2022,"r":3655489,"e":490577,"m":2.34},{"n":238150,"d":"Glass and Mirror Company","s":"FL","y":2022,"r":1233060,"e":295989,"m":2.87},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning Contractor","s":"NC","y":2022,"r":803385,"e":261322,"m":1.34},{"n":238210,"d":"Outdoor Lighting Contractor","s":"VA","y":2022,"r":528899,"e":151574,"m":2.18},{"n":561730,"d":"Landscaping Service","s":"","y":2022,"r":6108897,"e":1228967,"m":2.93},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2022,"r":2283463,"e":629589,"m":5.08},{"n":424910,"d":"Landscape Supply Business (75% wholesale, 25% retail)","s":"PA","y":2022,"r":3505109,"e":354063,"m":3.25},{"n":238170,"d":"Gutter Installation Company","s":"FL","y":2022,"r":1176494,"e":218559,"m":1.97},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning Contractor","s":"SC","y":2022,"r":404658,"e":150487,"m":0.86},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Service and Installation Busin","s":"CA","y":2022,"r":1327586,"e":310781,"m":2.64},{"n":238350,"d":"Custom Door and Window Replacement Company","s":"CA","y":2022,"r":1891000,"e":276000,"m":2.51},{"n":238990,"d":"Backyard Structures Contractor","s":"BC","y":2022,"r":1366198,"e":371084,"m":0.46},{"n":561730,"d":"Landscaping and Irrigation Install","s":"MS","y":2022,"r":387040,"e":72110,"m":3.47},{"n":236118,"d":"Outdoor Custom Contracting Business","s":"FL","y":2022,"r":1349567,"e":376460,"m":0.86},{"n":238150,"d":"Residential and Commercial Glass Installation, Repair and Replacement","s":"CO","y":2022,"r":5659821,"e":874324,"m":3.09},{"n":236118,"d":"Residential and Commercial Kitchen and Bathroom Remodeling","s":"FL","y":2022,"r":1397684,"e":125624,"m":3.58},{"n":444240,"d":"Retail Nursery that also offers Landscape Design  and Installation","s":"FL","y":2022,"r":6174424,"e":707908,"m":2.61},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"OR","y":2022,"r":3300000,"e":668000,"m":3.37},{"n":238330,"d":"Flooring Contractor","s":"IA","y":2022,"r":650982,"e":119792,"m":0.97},{"n":561730,"d":"Commercial Landscaping Business","s":"FL","y":2022,"r":546627,"e":189470,"m":1.45},{"n":238220,"d":"Lawn Irrigation Installation Company Franchise","s":"GA","y":2022,"r":1420436,"e":377813,"m":2.65},{"n":236118,"d":"Water Damage Remediation Company","s":"CA","y":2022,"r":900996,"e":281480,"m":1.92},{"n":561730,"d":"Lawn Care and Landscaping Business","s":"FL","y":2022,"r":184396,"e":94625,"m":1.64},{"n":238330,"d":"Flooring Contractor","s":"TX","y":2022,"r":1650000,"e":600653,"m":0.75},{"n":339113,"d":"Reconstruction Post-Mortem Prosthetics Company that uses Recycled and Refurbishe","s":"UT","y":2022,"r":75914,"e":22051,"m":4.53},{"n":561730,"d":"Landscaping Services","s":"MN","y":2022,"r":150000,"e":77314,"m":1.23},{"n":236220,"d":"Commercial Pool Contractor","s":"VA","y":2022,"r":4134318,"e":307746,"m":4.39},{"n":238330,"d":"Flooring Contractor","s":"FL","y":2022,"r":1559474,"e":380888,"m":1.97},{"n":238150,"d":"Windows and Doors Contractor","s":"WA","y":2022,"r":658282,"e":97081,"m":1.8},{"n":611519,"d":"HVAC-R Technical School","s":"TX","y":2022,"r":305235,"e":132018,"m":0.48},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2022,"r":113799,"e":29761,"m":2.52},{"n":238170,"d":"Siding and Roofing Company","s":"TN","y":2022,"r":24770798,"e":3120210,"m":5.65},{"n":238220,"d":"Residential Plumbing Contractor","s":"FL","y":2022,"r":1827862,"e":286853,"m":2.63},{"n":238220,"d":"Residential Heating, Ventilation, and Air Conditioning (HVAC) Services","s":"NC","y":2022,"r":1085417,"e":75736,"m":4.62},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"FL","y":2022,"r":1861621,"e":306606,"m":1.14},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (10% Commercial and","s":"WI","y":2022,"r":1406179,"e":237125,"m":2.31},{"n":238220,"d":"HVAC Company (90% residential, 10% commercial)","s":"FL","y":2022,"r":692636,"e":122758,"m":2.04},{"n":238220,"d":"HVAC Contractor (90% residential, 10% commercial)","s":"FL","y":2022,"r":709069,"e":148373,"m":1.68},{"n":238350,"d":"Garage Door Installation and Service","s":"PA","y":2022,"r":517221,"e":161597,"m":2.78},{"n":238220,"d":"Residential and Commercial HVAC Contractor","s":"FL","y":2022,"r":4836690,"e":665657,"m":2.69},{"n":238990,"d":"Fencing Contractor","s":"ID","y":2022,"r":9026784,"e":1636481,"m":1.63},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2022,"r":1855785,"e":165552,"m":3.62},{"n":238150,"d":"Glass and Mirror Fabrication and Installation","s":"OR","y":2022,"r":768000,"e":156000,"m":2.89},{"n":238220,"d":"Installation and Maintenance of Irrigation Systems for the Residential Market","s":"QC","y":2022,"r":351000,"e":83195,"m":2.25},{"n":561730,"d":"Landscaping","s":"MA","y":2022,"r":633158,"e":196110,"m":1.2},{"n":238210,"d":"Electrical Contractor Focused on Commercial and Multi-Unit Construction Projects","s":"CT","y":2021,"r":9579529,"e":2272972,"m":1.89},{"n":237130,"d":"Utility Construction Services Contractor","s":"","y":2021,"r":10000000,"e":2800000,"m":4.82},{"n":237990,"d":"Construction Contractor","s":"ON","y":2021,"r":15025377,"e":1145679,"m":5.16},{"n":561730,"d":"Landscaping and Snow Removal Company","s":"MI","y":2021,"r":1741344,"e":604305,"m":1.98},{"n":238990,"d":"High-End Pool Contractor","s":"NY","y":2021,"r":23348930,"e":4986196,"m":6.22},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"TX","y":2021,"r":942630,"e":38304,"m":6.5},{"n":423720,"d":"Plumber","s":"UT","y":2021,"r":431356,"e":135860,"m":2.21},{"n":238390,"d":"Full-Service Concrete Restoration and Specialty Coatings Business","s":"CO","y":2021,"r":1263450,"e":562943,"m":3.07},{"n":561730,"d":"Landscape Design and Maintenance","s":"FL","y":2021,"r":6370903,"e":842159,"m":3.18},{"n":238220,"d":"HVAC Contractor","s":"FL","y":2021,"r":1709436,"e":170156,"m":2.91},{"n":541511,"d":"Website Development Company","s":"FL","y":2021,"r":301122,"e":158294,"m":2.02},{"n":238220,"d":"HVAC Contractor","s":"FL","y":2021,"r":1681529,"e":442603,"m":2.49},{"n":238220,"d":"Residential and Commercial HVAC Contractor","s":"FL","y":2021,"r":812547,"e":123368,"m":1.82},{"n":238150,"d":"Glass and Glazing Contractors","s":"CO","y":2021,"r":747180,"e":101240,"m":3.46},{"n":238990,"d":"Hurricane Shutters Contractor","s":"FL","y":2021,"r":1879115,"e":372485,"m":1.34},{"n":238150,"d":"Residential, Commercial and Auto Glass Business","s":"CO","y":2021,"r":735081,"e":159082,"m":1.38},{"n":238190,"d":"Sells and Installs Hurricane Shutters","s":"FL","y":2021,"r":1766762,"e":445177,"m":1.12},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"CO","y":2021,"r":797109,"e":48548,"m":9.27},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (94% Residential an","s":"CA","y":2021,"r":6895040,"e":1705815,"m":6.07},{"n":238210,"d":"Residential Electrical Contractor","s":"FL","y":2021,"r":811824,"e":215761,"m":2.32},{"n":423810,"d":"Sells and Services Technology Equipment to the Construction Sector, including GP","s":"GA","y":2021,"r":7746528,"e":1765902,"m":4.81},{"n":562111,"d":"Construction Dumpster Rental Franchise","s":"NC","y":2021,"r":402000,"e":58854,"m":8.0},{"n":238320,"d":"Painting Contractor","s":"CA","y":2021,"r":655118,"e":229794,"m":1.23},{"n":424720,"d":"Petroleum and Heating, Ventilation, and Air Conditioning (HVAC) Distributor","s":"PA","y":2021,"r":5900000,"e":943000,"m":2.63},{"n":561730,"d":"Commercial and Residential Landscaping Company","s":"AL","y":2021,"r":81763,"e":15000,"m":4.0},{"n":238210,"d":"Commercial and Residential Standby Generator Dealer with Installation and Servic","s":"FL","y":2021,"r":3662223,"e":1140217,"m":1.56},{"n":238990,"d":"Provides River Rock Installation, Reseals, and Decorative Concrete","s":"FL","y":2021,"r":118341,"e":58651,"m":1.02},{"n":238910,"d":"Site Preparation","s":"FL","y":2021,"r":34358575,"e":8319113,"m":2.04},{"n":111421,"d":"Grows Plants for Landscapers, Brokers, and Nurseries","s":"FL","y":2021,"r":556387,"e":215703,"m":2.32},{"n":238350,"d":"Finish Carpentry Contractor","s":"FL","y":2021,"r":231703,"e":35967,"m":1.64},{"n":238220,"d":"HVAC Contractor (60% residential, 40% commercial)","s":"FL","y":2021,"r":1195671,"e":204567,"m":3.5},{"n":238210,"d":"Electrical Contractor","s":"CO","y":2021,"r":2501602,"e":611881,"m":3.11},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (90% Residential, 1","s":"FL","y":2021,"r":837939,"e":141195,"m":1.95},{"n":236118,"d":"Remodeling Contractor","s":"PA","y":2021,"r":4388963,"e":282545,"m":1.59},{"n":561730,"d":"Michigan Landscaping and Snow Removal Company","s":"MI","y":2021,"r":1741511,"e":604305,"m":2.23},{"n":238220,"d":"Residential and Commercial Plumbing Company (70% Residential, 30% Commercial)","s":"GA","y":2021,"r":3508761,"e":447220,"m":6.6},{"n":561730,"d":"Full-Service Commercial Landscaper","s":"CO","y":2021,"r":898951,"e":315555,"m":1.58},{"n":541320,"d":"Designs and Services Plant Interiorscapes for Commercial Buildings","s":"FL","y":2021,"r":327692,"e":73823,"m":2.84},{"n":238220,"d":"HVAC Contractor (60% commercial, 40% residential)","s":"FL","y":2021,"r":2030690,"e":147858,"m":4.4},{"n":561730,"d":"Commercial Landscape and Snow Removal","s":"PA","y":2021,"r":12978095,"e":1722703,"m":7.89},{"n":332710,"d":"Contract CNC Machining and Sheet Metal Work","s":"FL","y":2021,"r":702297,"e":164974,"m":4.65},{"n":561730,"d":"Commercial and Residential Landscape Business","s":"IL","y":2021,"r":303535,"e":99830,"m":2.0},{"n":238990,"d":"Concrete Contractor","s":"ID","y":2021,"r":1030721,"e":452265,"m":2.65},{"n":449129,"d":"Art Framing","s":"FL","y":2021,"r":440627,"e":16283,"m":8.6},{"n":337110,"d":"Customer Cabinet Design Company (contractors manufacture and install)","s":"FL","y":2021,"r":1100611,"e":152707,"m":3.11},{"n":238170,"d":"Gutter Contractor Providing Gutter and Downspout Installation","s":"CO","y":2021,"r":129966,"e":68647,"m":0.36},{"n":238220,"d":"Lawn Irrigation Business","s":"VA","y":2021,"r":864144,"e":264831,"m":1.88},{"n":238170,"d":"Gutter Contractor","s":"FL","y":2021,"r":1233292,"e":234386,"m":3.65},{"n":238220,"d":"HVAC Contractor (85% commercial, 15% residential)","s":"FL","y":2021,"r":956491,"e":162419,"m":2.46},{"n":238170,"d":"Gutter Contractor","s":"FL","y":2021,"r":1296869,"e":259294,"m":2.29},{"n":238350,"d":"Cabinet and Countertop Design and Installation","s":"FL","y":2021,"r":1488562,"e":189697,"m":1.58},{"n":238210,"d":"Sales, Installation, Maintenance of Generators","s":"NH","y":2021,"r":2500000,"e":495700,"m":3.83},{"n":238210,"d":"Generator Installation, Service, and Sales","s":"NJ","y":2021,"r":2248500,"e":541317,"m":2.4},{"n":238330,"d":"Flooring Contractor","s":"NV","y":2021,"r":243606,"e":188233,"m":0.96},{"n":238990,"d":"Brick Pavers and Stone Projects Contractor","s":"FL","y":2021,"r":2003491,"e":248389,"m":1.61},{"n":238220,"d":"Residential HVAC Company","s":"CT","y":2021,"r":802902,"e":225759,"m":3.1},{"n":238160,"d":"Residential Roofing Contractor","s":"MN","y":2021,"r":32615977,"e":7762946,"m":5.8},{"n":238220,"d":"HVAC Company","s":"FL","y":2021,"r":1945969,"e":342273,"m":2.13},{"n":238120,"d":"Structural Steel Erection Company","s":"NC","y":2021,"r":4549080,"e":878811,"m":2.67},{"n":238330,"d":"Flooring Contractor","s":"FL","y":2021,"r":269974,"e":82548,"m":2.42},{"n":337215,"d":"Contractor Building Wood Partitions and Fixtures","s":"TX","y":2021,"r":2151717,"e":361460,"m":1.25},{"n":238990,"d":"Pool Contractor","s":"HI","y":2021,"r":1363124,"e":346823,"m":3.46},{"n":238350,"d":"Carpentry","s":"OH","y":2021,"r":1476531,"e":460741,"m":1.79},{"n":238390,"d":"Building Finishing Contractor","s":"OK","y":2021,"r":4948105,"e":774410,"m":2.08},{"n":238990,"d":"Asphalt and Paving Contractor","s":"FL","y":2021,"r":1057095,"e":138096,"m":5.07},{"n":238220,"d":"Residential and Commercial Plumbing Business","s":"AL","y":2021,"r":606000,"e":123000,"m":2.44},{"n":238350,"d":"Window and Door Contractor","s":"TX","y":2021,"r":894514,"e":293253,"m":2.47},{"n":238150,"d":"Glass Company","s":"FL","y":2021,"r":5853443,"e":503542,"m":3.59},{"n":238220,"d":"Commercial HVAC Business","s":"","y":2021,"r":1750000,"e":195000,"m":2.49},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Service Company (0% Residentia","s":"CT","y":2021,"r":2500000,"e":841921,"m":1.43},{"n":238150,"d":"Commercial Glass Company","s":"FL","y":2021,"r":708533,"e":193259,"m":1.24},{"n":238160,"d":"Roofing Contractor","s":"MO","y":2021,"r":2726473,"e":443509,"m":1.69},{"n":238340,"d":"Ceiling Tile Restoration and Maintenance","s":"MA","y":2021,"r":5200000,"e":1069225,"m":4.21},{"n":238220,"d":"Commercial Heating, Ventilation, and Air Conditioning (HVAC) Services","s":"CA","y":2021,"r":13850000,"e":4342000,"m":5.64},{"n":238220,"d":"HVAC Company","s":"VA","y":2021,"r":1410793,"e":429082,"m":1.86},{"n":332710,"d":"CNC/Sheet Metal Machine Shop","s":"MN","y":2021,"r":1056380,"e":158120,"m":12.02},{"n":238220,"d":"Lawn Irrigation Business","s":"KS","y":2021,"r":1008318,"e":114492,"m":1.94},{"n":238160,"d":"Commercial Roofing, Waterproofing, and Concrete Floor Restoration Business","s":"CO","y":2021,"r":1265896,"e":303335,"m":2.48},{"n":561730,"d":"Landscaping Company","s":"MA","y":2021,"r":1340845,"e":218271,"m":3.48},{"n":238210,"d":"Installer of Residential and Small Commercial Solar Energy Systems","s":"PA","y":2021,"r":3149642,"e":708059,"m":2.4},{"n":238220,"d":"Specialty Piping Contractor","s":"OH","y":2021,"r":5053661,"e":989810,"m":5.3},{"n":238170,"d":"Gutter Contractor","s":"FL","y":2021,"r":2247440,"e":668828,"m":2.92},{"n":238150,"d":"Glass and Mirror Fabrication and Installation","s":"OH","y":2021,"r":1815218,"e":574090,"m":2.91},{"n":238990,"d":"Paving Contractor","s":"NC","y":2021,"r":6401638,"e":1317000,"m":2.66},{"n":332323,"d":"Designs and Manfactures High End Arch Metals and Panel Systems for Commercial Co","s":"","y":2021,"r":5440400,"e":938000,"m":4.56},{"n":236118,"d":"General Contractor, Residential and Commercial","s":"FL","y":2021,"r":5941711,"e":355671,"m":2.74},{"n":238210,"d":"Electrical Contractor","s":"NC","y":2021,"r":8692763,"e":1330558,"m":3.19},{"n":238220,"d":"Plumbing and Heating Business","s":"CA","y":2021,"r":6180422,"e":89444,"m":14.53},{"n":236118,"d":"Construction Handyman Service","s":"NJ","y":2021,"r":752943,"e":180771,"m":2.35},{"n":237310,"d":"Asphalt\u00a0Paving and Grading Road Work","s":"NV","y":2021,"r":5546487,"e":1069240,"m":1.87},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2021,"r":151619,"e":70438,"m":1.63},{"n":425120,"d":"Lumber Brokerage Firm","s":"NC","y":2021,"r":6538503,"e":564069,"m":2.66},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (85% Residential an","s":"GA","y":2021,"r":1597651,"e":418000,"m":3.4},{"n":238190,"d":"Pipe and Structural Fabrication and Welding","s":"CO","y":2021,"r":1144980,"e":383100,"m":5.26},{"n":238390,"d":"Franchise Garage Floor Coating Company","s":"CO","y":2021,"r":361343,"e":47832,"m":1.59},{"n":238990,"d":"Fencing Contractor","s":"UT","y":2021,"r":1600000,"e":500000,"m":2.4},{"n":423310,"d":"Lumber Wholesaler","s":"QC","y":2021,"r":42600000,"e":1945000,"m":3.73},{"n":236118,"d":"Franchised Home Improvement Contractor Business","s":"FL","y":2021,"r":1412123,"e":266819,"m":3.0},{"n":561740,"d":"Carpet Cleaning and Flooring Installation Company","s":"CO","y":2021,"r":565376,"e":208088,"m":2.04},{"n":238350,"d":"Finish Carpentry Contractors","s":"MN","y":2021,"r":1186137,"e":158411,"m":0.54},{"n":238320,"d":"Yacht and Boat Painting Business","s":"FL","y":2021,"r":293616,"e":31099,"m":4.82},{"n":238110,"d":"Concrete Raising and Leveling Company","s":"IL","y":2021,"r":1163896,"e":456713,"m":1.82},{"n":236118,"d":"Residential Remodeling Services","s":"MD","y":2021,"r":1197644,"e":286406,"m":3.09},{"n":238160,"d":"Roofing Company","s":"FL","y":2021,"r":4623494,"e":549003,"m":3.28},{"n":238220,"d":"HVAC Company","s":"TX","y":2021,"r":2615564,"e":438445,"m":3.42},{"n":238320,"d":"Painting Contractor","s":"VA","y":2021,"r":495846,"e":186655,"m":1.47},{"n":238350,"d":"Cabinet Refinishing Franchise","s":"ID","y":2021,"r":593040,"e":238079,"m":3.47},{"n":561730,"d":"Commercial Landscaping Business","s":"FL","y":2021,"r":9558172,"e":2292379,"m":1.31},{"n":238910,"d":"Excavation Work","s":"MT","y":2021,"r":557972,"e":96452,"m":2.44},{"n":561730,"d":"Commercial Landscape and Lawn Care","s":"FL","y":2021,"r":12024740,"e":2296051,"m":1.31},{"n":238220,"d":"HVAC Contractor (80% residential, 20% commercial)","s":"FL","y":2021,"r":6620894,"e":726002,"m":3.92},{"n":423330,"d":"Distributor of Roofing Materials","s":"FL","y":2021,"r":1255062,"e":295749,"m":5.92},{"n":238220,"d":"Residential HVAC Company","s":"DE","y":2021,"r":1443079,"e":289925,"m":1.55},{"n":238220,"d":"Plumbing and HVAC Contractor (70% residential, 30% commercial)","s":"FL","y":2021,"r":6381242,"e":778140,"m":6.43},{"n":238310,"d":"Drywall and Plastering Contractor for both Residential and Commercial Properties","s":"OR","y":2021,"r":552966,"e":204833,"m":1.22},{"n":236118,"d":"Residential Remodeling Services","s":"NC","y":2021,"r":4933558,"e":836896,"m":2.53},{"n":449129,"d":"Art Framing Company","s":"TX","y":2021,"r":287982,"e":118223,"m":2.17},{"n":561730,"d":"Landscaping Services","s":"TX","y":2021,"r":1225891,"e":182977,"m":4.48},{"n":238210,"d":"Solar Panel Installation and Sales","s":"CO","y":2021,"r":6674665,"e":1504712,"m":3.27},{"n":444240,"d":"Garden Supplies and Landscape Services","s":"FL","y":2021,"r":2081919,"e":406057,"m":3.2},{"n":238210,"d":"Electric Contractor","s":"FL","y":2021,"r":766872,"e":199776,"m":1.64},{"n":238910,"d":"Excavation Business with Aggregates","s":"WI","y":2021,"r":4416437,"e":685800,"m":6.82},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2021,"r":330446,"e":105176,"m":0.76},{"n":238220,"d":"Commercial HVAC Business","s":"CO","y":2021,"r":430262,"e":179480,"m":2.23},{"n":238220,"d":"Plumbing Contractor","s":"CO","y":2021,"r":2188535,"e":556786,"m":2.42},{"n":238220,"d":"HVAC Contractor (95% residential, 5% commercial)","s":"FL","y":2021,"r":2423265,"e":229674,"m":3.27},{"n":238220,"d":"Residential and Commercial Irrigation Company","s":"FL","y":2021,"r":258787,"e":53378,"m":1.87},{"n":236118,"d":"Kitchen Remodel Business Franchise","s":"KS","y":2021,"r":1400000,"e":370000,"m":2.7},{"n":449129,"d":"Online Retailer of Home Decor and Remodeling Products","s":"FL","y":2021,"r":914970,"e":333363,"m":3.3},{"n":238220,"d":"Residential Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"CA","y":2021,"r":2754696,"e":441694,"m":4.87},{"n":238210,"d":"Solar Energy System Sales, Design and Installation Contractor","s":"TX","y":2021,"r":1334122,"e":442250,"m":3.28},{"n":238220,"d":"Residential Plumbing Contractor","s":"CA","y":2021,"r":3244759,"e":1104062,"m":3.62},{"n":238220,"d":"Plumbing Services","s":"CA","y":2021,"r":3214385,"e":1370363,"m":2.92},{"n":423820,"d":"Landscape and Farm Equipment Distribution","s":"TX","y":2021,"r":3214042,"e":327937,"m":2.86},{"n":444110,"d":"Lumber Center","s":"PA","y":2021,"r":1698949,"e":169385,"m":5.82},{"n":444180,"d":"Distributor of Building Materials","s":"PA","y":2021,"r":16500000,"e":1127500,"m":6.12},{"n":238220,"d":"HVAC Contractor","s":"AK","y":2021,"r":7198546,"e":1118290,"m":5.37},{"n":238210,"d":"Electrical Contractor","s":"MN","y":2021,"r":1295199,"e":439387,"m":1.81},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2021,"r":559760,"e":83859,"m":3.22},{"n":238220,"d":"HVAC Contractor","s":"FL","y":2021,"r":1629185,"e":131028,"m":4.2},{"n":238990,"d":"Fencing Contractor","s":"FL","y":2021,"r":2046625,"e":280694,"m":1.43},{"n":236118,"d":"Constructs Residential and Commercial Storm Safety Shelters and Bulletproof Safe","s":"TX","y":2021,"r":1208126,"e":288208,"m":1.9},{"n":236118,"d":"Home Renovation Business","s":"OH","y":2021,"r":1476682,"e":379906,"m":1.5},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (90% Residential, 1","s":"PA","y":2021,"r":4848197,"e":665238,"m":3.16},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (100% Residential)","s":"VA","y":2021,"r":2907001,"e":276504,"m":3.8},{"n":236118,"d":"Remodeling Business","s":"CA","y":2021,"r":2047895,"e":202608,"m":2.43},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2021,"r":5033637,"e":1001527,"m":3.89},{"n":561730,"d":"Residential and Commercial Landscaping and Lawn Maintenance","s":"FL","y":2021,"r":540674,"e":48512,"m":3.73},{"n":238210,"d":"Electrical Contractor","s":"SC","y":2021,"r":1025455,"e":279680,"m":1.97},{"n":238330,"d":"Flooring Contractor","s":"NC","y":2021,"r":6885094,"e":648800,"m":2.42},{"n":561730,"d":"Lawn Care and Landscaping Services","s":"FL","y":2021,"r":678523,"e":92892,"m":2.58},{"n":236220,"d":"Swimming Pool Renovation and Repair","s":"FL","y":2021,"r":946411,"e":339451,"m":0.82},{"n":236115,"d":"Residential and Commercial General Contractor","s":"GA","y":2021,"r":1184916,"e":137000,"m":1.64},{"n":236118,"d":"Kitchen Remodeling Company","s":"PA","y":2021,"r":1103530,"e":337220,"m":2.37},{"n":238990,"d":"Specialized Home Improvement","s":"FL","y":2021,"r":1588422,"e":375737,"m":2.24},{"n":238220,"d":"HVAC Contractor (90% residential, 10% commercial)","s":"FL","y":2021,"r":2571400,"e":455614,"m":3.29},{"n":238310,"d":"Commercial Contractor Providing Structural and Interior Light Gauge Metal Stud F","s":"MN","y":2021,"r":5853835,"e":1079862,"m":3.98},{"n":561499,"d":"Company that Certifies Green Building Programs for Primarily Residential Constru","s":"ID","y":2021,"r":1173562,"e":591884,"m":3.21},{"n":238220,"d":"Air Conditioning Contractor","s":"FL","y":2021,"r":275130,"e":102288,"m":0.59},{"n":238220,"d":"HVAC Contractor","s":"FL","y":2021,"r":252304,"e":68781,"m":0.87},{"n":238350,"d":"Residential Custom Trim and Cabinets","s":"SC","y":2021,"r":1704657,"e":620979,"m":2.66},{"n":238990,"d":"Pool Construction Business","s":"FL","y":2021,"r":1617106,"e":262996,"m":1.67},{"n":238170,"d":"Aluminum Gutter Installation Company","s":"FL","y":2021,"r":1446461,"e":381594,"m":2.59},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2021,"r":1392478,"e":458009,"m":2.2},{"n":238210,"d":"Electric Contractor","s":"FL","y":2021,"r":1202745,"e":278775,"m":2.06},{"n":562211,"d":"Construction Waste Removal and Roll Off Company","s":"SC","y":2021,"r":1562250,"e":733494,"m":4.14},{"n":236118,"d":"Home Remodeling Business","s":"VA","y":2021,"r":1587466,"e":378713,"m":0.5},{"n":444240,"d":"Nursery and Landscape Company","s":"MN","y":2021,"r":762849,"e":142680,"m":2.84},{"n":561320,"d":"Land and Offshore Construction Staffing Agency","s":"FL","y":2021,"r":5330631,"e":325686,"m":1.21},{"n":238160,"d":"Residential and Commercial Roofing Contractor","s":"AB","y":2021,"r":1309315,"e":438962,"m":1.14},{"n":561730,"d":"Residential Landscaping","s":"FL","y":2021,"r":313652,"e":79701,"m":1.38},{"n":541330,"d":"Construction Engineering Service","s":"FL","y":2021,"r":1119490,"e":651552,"m":1.69},{"n":561730,"d":"Lawn Care Contractor","s":"PA","y":2021,"r":1444017,"e":255261,"m":9.63},{"n":561730,"d":"Commercial Landscaping","s":"TN","y":2021,"r":2103434,"e":716755,"m":3.63},{"n":561730,"d":"Landscaping and Tree Maintenance","s":"FL","y":2021,"r":244969,"e":120080,"m":0.67},{"n":237130,"d":"Contractor Focused on Laying Pipes for Fiber Optic Cables","s":"VA","y":2021,"r":8312722,"e":1656717,"m":1.51},{"n":238990,"d":"Enclosure Contractor","s":"FL","y":2021,"r":765829,"e":101333,"m":4.1},{"n":236118,"d":"General Contractor (70% commercial, 30% residential)","s":"FL","y":2021,"r":4505868,"e":193377,"m":2.07},{"n":237130,"d":"Communication Infrastructure Construction and Maintenance","s":"","y":2021,"r":2300000,"e":75000,"m":12.0},{"n":561730,"d":"Landscaping Company","s":"AZ","y":2021,"r":3261407,"e":417011,"m":3.36},{"n":321918,"d":"Commercial Millwork and Custom Carpentry Business","s":"FL","y":2021,"r":7045371,"e":230506,"m":9.54},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2021,"r":1233286,"e":27174,"m":13.21},{"n":238210,"d":"Commercial and Residential Electric Contractor","s":"FL","y":2021,"r":675365,"e":120304,"m":3.32},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"LA","y":2021,"r":1658239,"e":255142,"m":1.96},{"n":238160,"d":"Roofing Company","s":"MO","y":2021,"r":2576118,"e":699596,"m":1.64},{"n":238220,"d":"Plumbing Business","s":"FL","y":2021,"r":266862,"e":69409,"m":0.94},{"n":238220,"d":"Pluming Contractor","s":"FL","y":2021,"r":284184,"e":123784,"m":0.53},{"n":449129,"d":"Art Framing Store","s":"CO","y":2021,"r":499726,"e":120851,"m":2.07},{"n":236118,"d":"General Contractor","s":"NV","y":2021,"r":2687970,"e":535901,"m":2.24},{"n":238330,"d":"Flooring Contractor","s":"FL","y":2021,"r":2195683,"e":247883,"m":3.73},{"n":561730,"d":"Lawn Care and Landscaping Services","s":"CO","y":2021,"r":309864,"e":89596,"m":2.56},{"n":238220,"d":"Residential HVAC Company","s":"SC","y":2021,"r":819543,"e":238283,"m":1.51},{"n":238290,"d":"Installs Doors, Windows, Toilet Partitions, Visual Display Boards, Projection Sc","s":"WA","y":2021,"r":572227,"e":233398,"m":2.14},{"n":561720,"d":"Construction Cleanup Services","s":"FL","y":2021,"r":2367334,"e":579794,"m":1.55},{"n":561720,"d":"Construction Cleanup Services","s":"TX","y":2021,"r":868368,"e":140000,"m":2.71},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2021,"r":986664,"e":127787,"m":4.3},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Services","s":"NC","y":2021,"r":1149860,"e":95935,"m":4.12},{"n":111421,"d":"Nursery Growing for the Local Foliage and Landscape Nurseries","s":"FL","y":2021,"r":721513,"e":125476,"m":2.89},{"n":561499,"d":"Referral Services for the Construction Industry","s":"OR","y":2021,"r":1190000,"e":281608,"m":2.49},{"n":423720,"d":"Wholesale Plumbing Parts","s":"NC","y":2021,"r":5031410,"e":1085906,"m":3.13},{"n":238210,"d":"Electrical Contractor","s":"WA","y":2021,"r":5399712,"e":1027372,"m":2.58},{"n":532412,"d":"Heavy Construction Equipment Rental","s":"VA","y":2021,"r":1627912,"e":765335,"m":1.8},{"n":561730,"d":"Landscaping Services","s":"UT","y":2021,"r":781228,"e":146331,"m":3.25},{"n":423390,"d":"Specialty Building Materials Distributor","s":"ON","y":2021,"r":2314995,"e":737858,"m":2.03},{"n":238210,"d":"Electrical Contractors","s":"CO","y":2021,"r":6943511,"e":947146,"m":3.43},{"n":561730,"d":"Residential Lawn Maintenance and Landscaping Company","s":"FL","y":2021,"r":538376,"e":72435,"m":1.86},{"n":237110,"d":"Water Well Drilling and Maintenance Contractor","s":"LA","y":2021,"r":263885,"e":153431,"m":1.47},{"n":238150,"d":"Glass Replacement Services","s":"KY","y":2021,"r":280656,"e":55364,"m":1.26},{"n":236118,"d":"Residential Remodeling Business","s":"FL","y":2021,"r":4860376,"e":555467,"m":3.15},{"n":238220,"d":"Pluming Contractor","s":"PA","y":2021,"r":571810,"e":184087,"m":0.87},{"n":238350,"d":"Sale and Installation of Residential and Commercial Overhead Garage Doors","s":"MT","y":2021,"r":843444,"e":153085,"m":2.25},{"n":423320,"d":"Building Material Wholesaler (Primarily Limestone)","s":"OH","y":2021,"r":406042,"e":51668,"m":1.65},{"n":561730,"d":"Landscaping Service","s":"MN","y":2021,"r":594427,"e":163690,"m":2.23},{"n":238150,"d":"Glass and Glazing Contractor","s":"MI","y":2021,"r":2589419,"e":375000,"m":2.4},{"n":238150,"d":"Residential Glass and Window Business","s":"CT","y":2021,"r":1015471,"e":194373,"m":2.06},{"n":238150,"d":"Manufacture and Retail of Hurricane Impact Doors and Windows","s":"FL","y":2021,"r":6889013,"e":1072415,"m":3.92},{"n":238220,"d":"HVAC Contractor","s":"MD","y":2021,"r":3153899,"e":377369,"m":2.25},{"n":238210,"d":"Electrical Contractor","s":"RI","y":2021,"r":25764168,"e":2775651,"m":2.16},{"n":238220,"d":"Residential HVAC Contractor","s":"FL","y":2021,"r":3033480,"e":432690,"m":7.4},{"n":238210,"d":"Commercial Electrical Contractor","s":"FL","y":2021,"r":875382,"e":216879,"m":2.65},{"n":332216,"d":"Construction and Specialty Tool Manufacturing","s":"IL","y":2021,"r":279220,"e":46487,"m":4.48},{"n":238220,"d":"Pluming Contractor","s":"GA","y":2021,"r":410900,"e":60000,"m":2.42},{"n":236220,"d":"Grain Bin Constriction","s":"IA","y":2021,"r":2306044,"e":266348,"m":2.82},{"n":238160,"d":"Roofing Contractor","s":"GA","y":2021,"r":3800000,"e":505000,"m":2.65},{"n":561730,"d":"Landscaping Service","s":"NJ","y":2021,"r":1206793,"e":183680,"m":2.59},{"n":238350,"d":"Garage Door Sales and Installation","s":"MO","y":2021,"r":3223801,"e":348382,"m":3.73},{"n":238220,"d":"HVAC Company (70% residential, 30% light commercial/refrigeration)","s":"FL","y":2021,"r":661619,"e":138188,"m":1.99},{"n":238220,"d":"Plumbing Contractor","s":"MN","y":2021,"r":2677770,"e":666131,"m":4.2},{"n":238990,"d":"Franchised National Pet Fence Contractor","s":"NH","y":2021,"r":595225,"e":141282,"m":2.47},{"n":238210,"d":"Electrical Contractors","s":"MN","y":2021,"r":1177538,"e":277757,"m":2.82},{"n":541320,"d":"Full-Service Landscape Architecture Studio","s":"MT","y":2021,"r":673461,"e":179100,"m":1.56},{"n":238320,"d":"Painting Contractor","s":"OR","y":2021,"r":894000,"e":386000,"m":1.17},{"n":238350,"d":"Garage Door Contractor","s":"FL","y":2021,"r":840805,"e":94232,"m":2.39},{"n":238910,"d":"Environmental and Geotechnical Drilling Firm","s":"NJ","y":2021,"r":9578046,"e":1342191,"m":5.03},{"n":541320,"d":"Landscape Designer (home-based business)","s":"FL","y":2021,"r":216242,"e":119971,"m":1.21},{"n":561730,"d":"Full Service Landscaping Company","s":"KY","y":2021,"r":210900,"e":45275,"m":1.33},{"n":238220,"d":"Plumbing Contractor (75% residential, 25% commercial)","s":"FL","y":2021,"r":479381,"e":140170,"m":2.18},{"n":236220,"d":"Commercial and Industrial Construction, Construction Management and Design Build","s":"ID","y":2021,"r":2310989,"e":242817,"m":1.75},{"n":238310,"d":"Installation of Acoustical Ceiling Tiles","s":"CO","y":2021,"r":4500368,"e":1038783,"m":0.87},{"n":238990,"d":"Fencing Contractor","s":"","y":2021,"r":1345435,"e":646116,"m":1.52},{"n":238220,"d":"Pluming Contractor (60% Commercial and 40% Residential)","s":"FL","y":2021,"r":579980,"e":143271,"m":2.13},{"n":238290,"d":"Crane and Rigging Services","s":"NY","y":2021,"r":11887200,"e":4932227,"m":2.1},{"n":237110,"d":"Well Drilling, Pump Installation, Water Treatment, and Hydrofracking","s":"NS","y":2021,"r":1701926,"e":493387,"m":2.84},{"n":561730,"d":"Landscaping Contractor","s":"WA","y":2021,"r":941039,"e":166934,"m":3.0},{"n":333120,"d":"Construction Equipment Manufacturer","s":"WA","y":2021,"r":3088736,"e":628514,"m":3.08},{"n":238210,"d":"Electrical Contractor","s":"MA","y":2021,"r":27436365,"e":2746300,"m":0.73},{"n":333120,"d":"Construction Machine Manufacturer and Disbtributor","s":"WA","y":2021,"r":3080000,"e":628525,"m":3.08},{"n":238330,"d":"Installation and Sales of Flooring Materials","s":"FL","y":2021,"r":1053362,"e":97539,"m":2.82},{"n":237130,"d":"Design and Installation of Fiber Optic and Copper Data Cable to Provide Voice an","s":"CA","y":2021,"r":1751672,"e":364783,"m":2.19},{"n":238220,"d":"HVAC Company","s":"SC","y":2021,"r":1130577,"e":161448,"m":2.94},{"n":561730,"d":"Landscaping","s":"TX","y":2021,"r":223814,"e":64296,"m":1.87},{"n":238210,"d":"Electrical Contractor","s":"GA","y":2021,"r":5446752,"e":770644,"m":5.07},{"n":332216,"d":"Construction Tool Manufacturing","s":"CA","y":2021,"r":89540,"e":31452,"m":3.34},{"n":238310,"d":"Spray Foam Insulation Company","s":"NY","y":2021,"r":5932824,"e":930065,"m":4.14},{"n":561730,"d":"Landscape Maintenance Business","s":"BC","y":2021,"r":271424,"e":66201,"m":1.28},{"n":236118,"d":"Full-Service Kitchen and Bathroom Renovation with Showroom with Sales","s":"FL","y":2021,"r":1570459,"e":323319,"m":2.09},{"n":449129,"d":"Art Framing Production and Retail Art Gallery","s":"HI","y":2021,"r":348893,"e":55643,"m":2.29},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (50% Commercial and","s":"CA","y":2021,"r":1186319,"e":212097,"m":2.35},{"n":561730,"d":"Lawn Care and Landscaping (90% residential, 10% commercial)","s":"FL","y":2021,"r":269268,"e":122526,"m":1.55},{"n":561730,"d":"Landscaping Company","s":"WI","y":2021,"r":333247,"e":101600,"m":2.21},{"n":561730,"d":"Full Service Landscaping Company","s":"WI","y":2021,"r":345000,"e":121000,"m":1.86},{"n":561730,"d":"Commercial Landscaper","s":"CA","y":2021,"r":3557722,"e":403000,"m":3.6},{"n":333415,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Register Manufacturer","s":"CA","y":2021,"r":4190358,"e":2063400,"m":4.37},{"n":332999,"d":"Home Improvement Product Manufacturer","s":"CA","y":2021,"r":4190358,"e":2063400,"m":4.36},{"n":238220,"d":"Pluming Contractor","s":"TX","y":2021,"r":1055903,"e":362977,"m":3.5},{"n":238210,"d":"Installation of Electronic Indoor Boundaries for Pets","s":"OR","y":2021,"r":179113,"e":85110,"m":1.35},{"n":238990,"d":"Paves Concrete Parking Lots and Provides Parking Lot Maintenance","s":"FL","y":2021,"r":4827128,"e":710027,"m":1.83},{"n":238220,"d":"HVAC Company","s":"FL","y":2021,"r":3449942,"e":656743,"m":5.86},{"n":561730,"d":"Landscape Design Services","s":"WA","y":2021,"r":2595863,"e":687806,"m":2.3},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"TX","y":2021,"r":5737950,"e":667001,"m":5.29},{"n":561730,"d":"Landscaping Services","s":"TX","y":2021,"r":1121186,"e":236470,"m":3.36},{"n":332322,"d":"Sheet Metal Fabrication","s":"WA","y":2021,"r":4568473,"e":412875,"m":2.91},{"n":423810,"d":"Online Retailer of Contractor Parts and Accessories","s":"FL","y":2021,"r":8381935,"e":949390,"m":3.61},{"n":561730,"d":"Landscape Services Business","s":"TX","y":2021,"r":1699476,"e":301895,"m":2.32},{"n":238910,"d":"Demolition Company","s":"CA","y":2021,"r":2200293,"e":345977,"m":1.34},{"n":238190,"d":"Supplier and Installer of Aluminum Pergolas and Shade Structures and with Louver","s":"FL","y":2021,"r":2015343,"e":196004,"m":6.12},{"n":238150,"d":"Manufacture and Installation of Widows and Glass Doors","s":"FL","y":2021,"r":983614,"e":191100,"m":2.09},{"n":238210,"d":"Commercial Electrical Contractor","s":"FL","y":2021,"r":782838,"e":163970,"m":0.91},{"n":561730,"d":"Landscape Maintenance Services","s":"TX","y":2021,"r":510596,"e":204294,"m":2.2},{"n":238220,"d":"Heating Ventilation and Air Conditioning (HVAC) Contractor","s":"NC","y":2021,"r":461029,"e":104610,"m":0.48},{"n":238220,"d":"Heating Ventilation and Air Conditioning (HVAC) Contractor","s":"VA","y":2021,"r":534097,"e":149221,"m":0.67},{"n":236115,"d":"Custom Home Design, Construction, and Renovation Business","s":"ID","y":2021,"r":2618934,"e":229633,"m":1.35},{"n":238170,"d":"Exterior Siding Contractor","s":"ON","y":2021,"r":286210,"e":51505,"m":3.55},{"n":339999,"d":"Elevator Interiors Manufacturing and Contractor","s":"WA","y":2021,"r":5884951,"e":1543100,"m":3.91},{"n":424690,"d":"Construction Explosives Distributor","s":"NC","y":2021,"r":13500000,"e":725000,"m":11.03},{"n":444180,"d":"Retailer of Lumber and Hardware","s":"PA","y":2021,"r":7571086,"e":242697,"m":7.17},{"n":561730,"d":"Residential Lawn and Landscape Maintenance and Installation Business","s":"FL","y":2021,"r":241227,"e":51406,"m":2.14},{"n":238990,"d":"Residential and Commercial Fencing Company","s":"WA","y":2021,"r":1121094,"e":531685,"m":2.35},{"n":423830,"d":"Dealer/Distributor of Commercial and Industrial Equipment to Landscapers, Arbori","s":"CA","y":2021,"r":23651343,"e":1540222,"m":5.36},{"n":236118,"d":"Home Repair Franchises","s":"BC","y":2021,"r":648180,"e":123527,"m":1.34},{"n":561730,"d":"Landscaping Company","s":"NH","y":2021,"r":1034951,"e":344780,"m":1.0},{"n":238220,"d":"HVAC Company (90% residential, 10% light commercial)","s":"FL","y":2021,"r":496964,"e":138942,"m":2.16},{"n":238170,"d":"Gutters Contractor","s":"NC","y":2021,"r":649492,"e":128306,"m":1.36},{"n":238990,"d":"Commercial and Residential Fencing Company","s":"OR","y":2021,"r":1460000,"e":414500,"m":1.94},{"n":238160,"d":"Roofing Business","s":"NH","y":2021,"r":2412085,"e":546831,"m":0.88},{"n":561730,"d":"Landscape Design and Installation","s":"AR","y":2021,"r":6119293,"e":894981,"m":2.91},{"n":238990,"d":"Pool Contractor","s":"AL","y":2021,"r":29156022,"e":4915757,"m":3.5},{"n":238220,"d":"Plumbing and Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"MA","y":2021,"r":1428508,"e":133629,"m":3.44},{"n":238990,"d":"Crane Operator Service Company","s":"FL","y":2021,"r":861813,"e":271718,"m":3.97},{"n":238330,"d":"Installation and Sales of Flooring Materials","s":"CO","y":2021,"r":3468812,"e":575435,"m":3.04},{"n":238220,"d":"Heating Ventilation and Air Conditioning (HVAC) Contractor","s":"TX","y":2021,"r":559676,"e":184851,"m":1.03},{"n":238220,"d":"Pluming Contractor","s":"AL","y":2021,"r":511970,"e":239720,"m":0.83},{"n":238220,"d":"Plumbing Company (90% commercial, 10% residential)","s":"MN","y":2021,"r":916614,"e":169369,"m":1.03},{"n":238110,"d":"Poured Concrete Foundation and Structure Contractor","s":"SC","y":2021,"r":8112350,"e":886565,"m":3.83},{"n":561730,"d":"Full Service Landscaping Company","s":"TX","y":2021,"r":1286290,"e":42881,"m":4.08},{"n":561730,"d":"Residential and Commercial Landscaping","s":"FL","y":2021,"r":207433,"e":28963,"m":5.7},{"n":238220,"d":"Residential and Commercial Plumbing","s":"CA","y":2021,"r":2350296,"e":746979,"m":0.74},{"n":238220,"d":"Plumbing and Irrigation Contractor","s":"BC","y":2021,"r":1130069,"e":56803,"m":4.67},{"n":238220,"d":"Heating Ventilation and Air Conditioning (HVAC) Contractor","s":"CA","y":2021,"r":1110996,"e":127667,"m":3.13},{"n":238220,"d":"Commercial and Residential Plumbing Company","s":"OR","y":2021,"r":4625549,"e":301511,"m":2.49},{"n":238990,"d":"Wine Cellars, Saunas, and Steam Room Contractor","s":"","y":2021,"r":1419157,"e":200397,"m":3.24},{"n":561730,"d":"Full Service Landscaping Company","s":"GA","y":2021,"r":126000,"e":55000,"m":0.91},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"PA","y":2021,"r":4848197,"e":665238,"m":4.43},{"n":561730,"d":"Landscaping Services","s":"TX","y":2021,"r":1641556,"e":243934,"m":2.05},{"n":238290,"d":"Programming and Repair of Gas Station Pumps","s":"MD","y":2021,"r":1448258,"e":98829,"m":1.08},{"n":238220,"d":"HVAC Company","s":"FL","y":2021,"r":7426084,"e":676884,"m":2.66},{"n":327390,"d":"Precast Concrete Manufacturer","s":"CA","y":2021,"r":12585938,"e":2365965,"m":3.42},{"n":238220,"d":"Fire Sprinklers Installation","s":"SC","y":2021,"r":413126,"e":312340,"m":1.49},{"n":561730,"d":"Provides Landscaping, Irrigation, and Ancillary Services to Builders","s":"FL","y":2021,"r":9618038,"e":2094365,"m":3.16},{"n":238210,"d":"Electrical Contractor","s":"ON","y":2021,"r":1400000,"e":215000,"m":1.63},{"n":561730,"d":"Landscaping and Irrigation Services","s":"FL","y":2021,"r":10202713,"e":3057371,"m":2.17},{"n":561730,"d":"Landscaping and Pest Control Services","s":"FL","y":2021,"r":1558398,"e":359252,"m":3.2},{"n":238220,"d":"Heating Ventilation and Air Conditioning (HVAC) Contractor","s":"IN","y":2021,"r":875000,"e":187000,"m":2.27},{"n":541360,"d":"Concrete Scanning and Utility Locating Services","s":"TX","y":2020,"r":2306238,"e":933021,"m":6.97},{"n":236220,"d":"Commercial and Industrial Builder","s":"SD","y":2020,"r":17235203,"e":1710552,"m":1.17},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (50% commercial and","s":"CA","y":2020,"r":3376169,"e":411082,"m":2.92},{"n":327991,"d":"Countertop Contractor","s":"NC","y":2020,"r":2441122,"e":313712,"m":2.53},{"n":238990,"d":"Fence and Deck Sales and Installation","s":"UT","y":2020,"r":4326078,"e":571523,"m":2.27},{"n":238910,"d":"Excavation Company","s":"SD","y":2020,"r":2584000,"e":1265000,"m":1.19},{"n":238220,"d":"HVAC Company","s":"OR","y":2020,"r":244018,"e":80617,"m":2.42},{"n":238350,"d":"Window and Door Business","s":"FL","y":2020,"r":1937927,"e":170736,"m":2.23},{"n":237110,"d":"Water Well Drilling and Services Related Pumps and Equipment","s":"MN","y":2020,"r":1549443,"e":711682,"m":1.69},{"n":238320,"d":"Painting Contractor","s":"TX","y":2020,"r":390048,"e":87000,"m":1.05},{"n":236118,"d":"Handyman Service","s":"CO","y":2020,"r":262008,"e":76071,"m":0.39},{"n":238220,"d":"Plumbing Contractor (90% commercial, 10% residential)","s":"FL","y":2020,"r":3398845,"e":538144,"m":2.34},{"n":238210,"d":"Home Theater Installation","s":"CO","y":2020,"r":1235956,"e":117437,"m":2.98},{"n":333415,"d":"Commercial and Industrial Refrigeration and HVAC Service, Repair, and Preventati","s":"PA","y":2020,"r":3555123,"e":904435,"m":2.65},{"n":238350,"d":"Garage Door Service and Installation","s":"CA","y":2020,"r":3899582,"e":235838,"m":4.24},{"n":238220,"d":"Plumbing, Heating and Air Contractor","s":"NJ","y":2020,"r":9834702,"e":816637,"m":9.18},{"n":423310,"d":"Wholesale Building Materials","s":"KS","y":2020,"r":670608,"e":57502,"m":1.3},{"n":238210,"d":"Installs, Repairs and Inspects Fire Alarm Systems and their Components","s":"UT","y":2020,"r":592768,"e":193400,"m":1.55},{"n":561730,"d":"Commercial and Residential Lawn Maintenance and Landscape Company","s":"FL","y":2020,"r":791729,"e":108346,"m":3.23},{"n":238220,"d":"HVAC Company","s":"AZ","y":2020,"r":5605837,"e":1089342,"m":3.95},{"n":238350,"d":"Kitchen Cabinets Contractor","s":"FL","y":2020,"r":3996479,"e":977390,"m":3.07},{"n":238320,"d":"Painting Contractor","s":"CA","y":2020,"r":1103200,"e":134353,"m":2.05},{"n":238150,"d":"Commercial and Residential Glass and Window Business","s":"TX","y":2020,"r":1036841,"e":223623,"m":6.02},{"n":561730,"d":"Landscaping and Hardscaping Company (30% residential and 70% commercial)","s":"OH","y":2020,"r":3300000,"e":616626,"m":3.13},{"n":238310,"d":"Drywall, Framing, Insulation, and Finishing Contractor","s":"CO","y":2020,"r":2964369,"e":554957,"m":1.98},{"n":236118,"d":"Residential Remodeling and Renovation Company","s":"NC","y":2020,"r":2405787,"e":286693,"m":2.41},{"n":238330,"d":"Flooring Sales and Installation","s":"AZ","y":2020,"r":3537020,"e":505088,"m":3.66},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (90% Residential an","s":"VA","y":2020,"r":2628232,"e":418074,"m":2.99},{"n":238350,"d":"Kitchen Cabinets Contractor","s":"FL","y":2020,"r":1661971,"e":94631,"m":1.37},{"n":237110,"d":"Commercial Geothermal Drilling, Well Drilling and Pump Servicing Contractor","s":"CO","y":2020,"r":4934286,"e":822151,"m":4.87},{"n":238220,"d":"Plumbing Services","s":"AZ","y":2020,"r":848903,"e":155024,"m":2.64},{"n":238990,"d":"Specialty Trade Contractor","s":"CO","y":2020,"r":1025304,"e":124742,"m":2.81},{"n":238220,"d":"Plumbing Company","s":"FL","y":2020,"r":3246780,"e":713690,"m":0.17},{"n":561730,"d":"Landscaping and Snow Removal","s":"Ontario","y":2020,"r":1002237,"e":250316,"m":2.4},{"n":238290,"d":"Installation of Automatic Doors","s":"FL","y":2020,"r":892954,"e":220668,"m":2.04},{"n":238390,"d":"Installs Garage Storage Solutions, Organization and Flooring","s":"GA","y":2020,"r":652437,"e":174832,"m":1.54},{"n":238390,"d":"Window Covering Installation","s":"CO","y":2020,"r":447468,"e":92959,"m":1.56},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning Contractor (50% Residential and 50% C","s":"ON","y":2020,"r":1837201,"e":526304,"m":1.9},{"n":238320,"d":"Painting Contractor","s":"OR","y":2020,"r":890933,"e":343247,"m":1.31},{"n":238220,"d":"Plumbing Contractor","s":"NC","y":2020,"r":171432,"e":102619,"m":1.17},{"n":332322,"d":"Custom Sheet Metal Fabrication","s":"CA","y":2020,"r":1348066,"e":193110,"m":1.49},{"n":238350,"d":"Kitchen Cabinets Contractor","s":"FL","y":2020,"r":1190973,"e":253838,"m":1.67},{"n":444240,"d":"Garden Center and Nursery that also Provides Landscaping Design and Maintenance","s":"CO","y":2020,"r":8799589,"e":3695085,"m":3.94},{"n":237990,"d":"General Contractor Providing Comprehensive Concrete Structural Restoration and W","s":"OK","y":2020,"r":10104382,"e":2099830,"m":3.1},{"n":238160,"d":"Roofing Contractor","s":"SK","y":2020,"r":2372152,"e":701000,"m":2.64},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Service and Installation","s":"NY","y":2020,"r":1450029,"e":246351,"m":1.66},{"n":238220,"d":"Commercial and Residential HVAC Company","s":"TX","y":2020,"r":320800,"e":149700,"m":1.67},{"n":238150,"d":"Glass and Glazing Contractors","s":"TX","y":2020,"r":1854464,"e":484654,"m":2.79},{"n":237310,"d":"Geotechnical Contracting Company Specializing in Drilling and Grouting Services","s":"TN","y":2020,"r":3722472,"e":734142,"m":1.29},{"n":236118,"d":"Kitchen Renovations Franchise","s":"NE","y":2020,"r":325861,"e":74484,"m":1.34},{"n":238160,"d":"Roofing Company","s":"FL","y":2020,"r":28995822,"e":5084363,"m":3.86},{"n":561730,"d":"Landscape Maintenance for Commercial Properties","s":"CA","y":2020,"r":6000000,"e":771000,"m":3.83},{"n":238990,"d":"Concrete Sawing and Coring Business","s":"","y":2020,"r":1296816,"e":322732,"m":3.47},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (90% Residential an","s":"GA","y":2020,"r":898039,"e":176566,"m":2.46},{"n":238110,"d":"","s":"FL","y":2020,"r":1296816,"e":480900,"m":2.33},{"n":332323,"d":"Metal Fabrication and Installation Serving Commercial General Construction Contr","s":"OR","y":2020,"r":2563502,"e":415784,"m":3.56},{"n":238310,"d":"Insulation Contractor (75% residential and 25% commercial)","s":"OH","y":2020,"r":611191,"e":172073,"m":1.45},{"n":444180,"d":"Window Sales and Installation Services to New Home Builders","s":"OH","y":2020,"r":9207558,"e":718531,"m":2.71},{"n":332322,"d":"Sheet Metal and Machining Fabrication","s":"CO","y":2020,"r":1952568,"e":382584,"m":2.98},{"n":238350,"d":"Marble and Granite Countertop Installation","s":"FL","y":2020,"r":1813322,"e":818469,"m":2.85},{"n":238210,"d":"Residential and Commercial Electrical Repairs, Remodeling, and New Electrical Se","s":"CA","y":2020,"r":274685,"e":72629,"m":0.99},{"n":238220,"d":"HVAC Contractor","s":"FL","y":2020,"r":2925343,"e":465239,"m":2.85},{"n":561730,"d":"Landscape Maintenance and Snow Removal","s":"ON","y":2020,"r":1845764,"e":256082,"m":1.87},{"n":238210,"d":"Provides Commercial and Residential Lighting Services, and Efficiency Consulting","s":"CA","y":2020,"r":487038,"e":266129,"m":2.25},{"n":238990,"d":"Radon Mitigation Services","s":"CO","y":2020,"r":824128,"e":171812,"m":2.82},{"n":238320,"d":"Painting Contractor","s":"GA","y":2020,"r":4907255,"e":1170221,"m":2.56},{"n":561730,"d":"Commercial Landscaping Business","s":"FL","y":2020,"r":354004,"e":129180,"m":2.13},{"n":238220,"d":"Commercial HVAC Company","s":"UT","y":2020,"r":14644045,"e":1941259,"m":2.2},{"n":238220,"d":"Residential Plumbing Contractor","s":"MT","y":2020,"r":972152,"e":408643,"m":1.76},{"n":238990,"d":"Installation and Repair of Automated Gate Systems","s":"CA","y":2020,"r":10336276,"e":3718924,"m":4.84},{"n":541511,"d":"Website Design for Residential Furniture Stores and Construction Companies","s":"OH","y":2020,"r":1237450,"e":373631,"m":2.28},{"n":238220,"d":"Fire Suppression Systems Contractor","s":"GA","y":2020,"r":1859247,"e":214916,"m":1.74},{"n":238210,"d":"Commercial and Industrial Electrical Contractors","s":"ON","y":2020,"r":1292590,"e":301146,"m":1.77},{"n":238160,"d":"Roofing Contractor","s":"CO","y":2020,"r":6600110,"e":1192160,"m":2.22},{"n":541990,"d":"Gas Pipeline Inspection and Repair Services","s":"AZ","y":2020,"r":802078,"e":322707,"m":3.56},{"n":238220,"d":"HVAC Company","s":"FL","y":2020,"r":388826,"e":74867,"m":1.2},{"n":561790,"d":"Pool Renovations and Repair","s":"FL","y":2020,"r":887318,"e":181778,"m":1.93},{"n":236118,"d":"Handyman Service","s":"OR","y":2020,"r":1037848,"e":166005,"m":2.71},{"n":561730,"d":"Landscaping Business","s":"CO","y":2020,"r":2488417,"e":687893,"m":1.87},{"n":238210,"d":"Provides Professional Holiday Decorating and Christmas Light Installation Servic","s":"TN","y":2020,"r":586875,"e":292929,"m":2.56},{"n":238320,"d":"Painting Contractor","s":"PA","y":2020,"r":658250,"e":134200,"m":1.37},{"n":238220,"d":"Lawn Irrigation Business","s":"FL","y":2020,"r":641090,"e":280792,"m":1.84},{"n":238990,"d":"Synthetic Turf installation Services","s":"TX","y":2020,"r":2333426,"e":474520,"m":2.85},{"n":238390,"d":"Waterproofing and Foundation Repair for Residential and Commercial Customers","s":"MI","y":2020,"r":2265413,"e":493726,"m":1.47},{"n":238320,"d":"Painting and Wall Covering Contractor","s":"TX","y":2020,"r":2889897,"e":860161,"m":2.09},{"n":238160,"d":"Roofing Contractor","s":"OK","y":2020,"r":2175985,"e":302901,"m":1.8},{"n":238150,"d":"Window and Door Installation","s":"CA","y":2020,"r":2327000,"e":325000,"m":0.85},{"n":561730,"d":"Landscaping Services","s":"IL","y":2020,"r":152490,"e":133875,"m":2.02},{"n":236118,"d":"Kitchen and Bathroom Remodeling","s":"CO","y":2020,"r":6397616,"e":842988,"m":2.64},{"n":236220,"d":"Commercial Building General Contractor","s":"CA","y":2020,"r":2271663,"e":282663,"m":1.01},{"n":238320,"d":"Commercial and Residential Painting Business Franchise","s":"NC","y":2020,"r":2777445,"e":526253,"m":2.19},{"n":238330,"d":"Flooring Contractor","s":"WA","y":2020,"r":741600,"e":135210,"m":0.67},{"n":237110,"d":"Water Well Drilling Company","s":"CO","y":2020,"r":2044802,"e":515925,"m":3.3},{"n":238140,"d":"Grout, Tile, Stone, and Wood Restoration","s":"TX","y":2020,"r":393262,"e":86978,"m":1.84},{"n":238910,"d":"Site-Preparation and Excavation Work on Water Connection/Repair/Service Related ","s":"ID","y":2020,"r":782103,"e":215522,"m":1.94},{"n":238220,"d":"HVAC Contractor (70% Residential/30% Commercial)","s":"FL","y":2020,"r":775317,"e":94295,"m":1.59},{"n":238160,"d":"Roofing Contractor","s":"NJ","y":2020,"r":2974540,"e":747633,"m":2.54},{"n":238350,"d":"Residential and Commercial Garage Door Installer and Service Provider","s":"FL","y":2020,"r":1632947,"e":361762,"m":1.8},{"n":238220,"d":"Residential Heating, Ventilation, and Air conditioning (HVAC) Contractor","s":"CA","y":2020,"r":832808,"e":150924,"m":0.66},{"n":236220,"d":"Fabricator and Installer of Elevator Interiors","s":"TX","y":2020,"r":1231182,"e":336783,"m":4.16},{"n":457110,"d":"Gas Station with light Mechanical Services","s":"MN","y":2020,"r":2177467,"e":252863,"m":2.4},{"n":327331,"d":"Manufacturer of Precast Concrete Products for the Construction Industry","s":"PA","y":2020,"r":7190209,"e":663909,"m":3.52},{"n":238210,"d":"Electrical Contractor (70% residential, 30% commercial)","s":"FL","y":2020,"r":1597890,"e":494795,"m":2.37},{"n":236220,"d":"Commercial Construction","s":"UT","y":2020,"r":14947719,"e":3007783,"m":2.46},{"n":561730,"d":"Residential Lawn and Landscaping Business","s":"FL","y":2020,"r":157538,"e":102745,"m":0.92},{"n":238220,"d":"Residential A/C & Heating Contractor","s":"FL","y":2020,"r":329558,"e":137624,"m":0.87},{"n":332322,"d":"Manufacture Standard and Custom Sheet Metal Products Primarily for the HVAC Indu","s":"FL","y":2020,"r":1111448,"e":314584,"m":3.02},{"n":238210,"d":"Residential and Commercial Electrical Contractor","s":"FL","y":2020,"r":7525057,"e":788846,"m":2.92},{"n":238350,"d":"Designing, Manufacturing, and Installation of Cabinets","s":"AL","y":2020,"r":1339197,"e":146130,"m":4.38},{"n":238220,"d":"Industrial Refrigeration Contractor","s":"IA","y":2020,"r":13659709,"e":3304627,"m":5.04},{"n":561730,"d":"Commercial Landscaping Maintenance and Installation","s":"TX","y":2020,"r":1871000,"e":445000,"m":2.64},{"n":562910,"d":"Remediation Contractor","s":"WI","y":2020,"r":950664,"e":409473,"m":1.61},{"n":238150,"d":"Franchise Repair and Replacement of Glass for Automobiles, Residential Buildings","s":"FL","y":2020,"r":1373897,"e":145116,"m":2.93},{"n":238220,"d":"Residential Plumbing and Gas Contractor","s":"VA","y":2020,"r":2295366,"e":418797,"m":0.84},{"n":238220,"d":"HVAC Company (95% residential, 5% commercial)","s":"SC","y":2020,"r":737602,"e":247645,"m":1.72},{"n":238990,"d":"Construction Screen Enclosure and Repair Business","s":"FL","y":2020,"r":500591,"e":126053,"m":1.82},{"n":561730,"d":"Commercial and Residential Lawn Care and Landscaping Business","s":"TX","y":2020,"r":1729310,"e":623739,"m":3.77},{"n":561730,"d":"Landscaping Services","s":"ON","y":2020,"r":1732965,"e":479807,"m":2.49},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor (60% Residential an","s":"OH","y":2020,"r":375877,"e":94819,"m":2.16},{"n":238350,"d":"Floor Restoration Company Specializing in Concrete Stain, Vinyl Chips Color Quar","s":"NC","y":2020,"r":414127,"e":148785,"m":1.68},{"n":238990,"d":"Residential Swimming Pool Design and Construction Service","s":"TX","y":2020,"r":2697919,"e":139592,"m":6.98},{"n":238990,"d":"Radon Mitigation and Testing Services","s":"CO","y":2020,"r":474389,"e":222112,"m":1.3},{"n":561730,"d":"Commercial Landscape Maintenance Business","s":"FL","y":2020,"r":810927,"e":166468,"m":3.12},{"n":236118,"d":"Restoration Services","s":"TX","y":2020,"r":386285,"e":145478,"m":1.75},{"n":238350,"d":"Window and Door installation","s":"CA","y":2020,"r":3609000,"e":180000,"m":1.25},{"n":541350,"d":"Energy Services Company providing Independent Ratings and Certification of Resid","s":"ID","y":2020,"r":1173562,"e":591884,"m":3.21},{"n":238220,"d":"HVAC Company (90% residential, 10% commercial)","s":"FL","y":2020,"r":203079,"e":113512,"m":0.79},{"n":238320,"d":"Residential Contract Painter","s":"CO","y":2020,"r":383921,"e":101547,"m":0.34},{"n":561730,"d":"Landscaping Services","s":"OH","y":2020,"r":610689,"e":204318,"m":1.52},{"n":561730,"d":"Residential and Commercial Lawn/Landscaping Business","s":"FL","y":2020,"r":660950,"e":131727,"m":3.8},{"n":561730,"d":"Commercial Landscape Maintenance and Installation","s":"OR","y":2020,"r":929420,"e":270588,"m":1.79},{"n":561730,"d":"Landscaping Business (50% Residential and 50% Commercial)","s":"OH","y":2020,"r":648171,"e":210290,"m":1.57},{"n":238220,"d":"Installation of Sprinkler and Irrigation Systems","s":"CO","y":2020,"r":230891,"e":103514,"m":0.77},{"n":238220,"d":"Residential and Commercial HVAC Service Company","s":"FL","y":2020,"r":1282644,"e":221601,"m":2.84},{"n":238150,"d":"Glass Company Providing Custom Made Shower Doors, Glass and Mirrors","s":"FL","y":2020,"r":406201,"e":49402,"m":1.72},{"n":238220,"d":"Residential and Commercial HVAC Contractor","s":"FL","y":2020,"r":498743,"e":75225,"m":2.66},{"n":561730,"d":"Landscaping Services","s":"AZ","y":2020,"r":379270,"e":191867,"m":1.04},{"n":238210,"d":"Electric Gate Repair and Service Business","s":"FL","y":2020,"r":259000,"e":76000,"m":1.32},{"n":238210,"d":"Electric Gate Repair and Service Business","s":"FL","y":2020,"r":221645,"e":74541,"m":1.34},{"n":444140,"d":"Power Tool and Contractor Supply Store","s":"FL","y":2020,"r":705043,"e":176410,"m":2.27},{"n":561730,"d":"Landscaping Services","s":"DE","y":2020,"r":2940334,"e":593119,"m":3.88},{"n":561730,"d":"Residential and Commercial Landscape and Lawn Services (home-based business)","s":"CA","y":2020,"r":195888,"e":71258,"m":1.18},{"n":238220,"d":"HVAC Company (80% residential, 20% commercial)","s":"FL","y":2020,"r":1689136,"e":354627,"m":4.37},{"n":444240,"d":"Landscape and Drainage Supply Store (Two Locations)","s":"AZ","y":2020,"r":2580437,"e":459078,"m":3.05},{"n":236115,"d":"Residential Home Builder and Remodeler","s":"NJ","y":2020,"r":3534894,"e":442255,"m":1.13},{"n":238220,"d":"Installation and Maintenance of Commercial Refrigeration Equipment","s":"NE","y":2020,"r":581699,"e":196272,"m":1.5},{"n":423730,"d":"Warm Air Heating and Air-Conditioning Equipment and Supplier","s":"QC","y":2020,"r":3805578,"e":132000,"m":4.17},{"n":238350,"d":"Cabinet Refinishing Company","s":"FL","y":2020,"r":570279,"e":127851,"m":2.15},{"n":423310,"d":"Specialty Distributor of Lumber","s":"PA","y":2020,"r":5200000,"e":800000,"m":2.63},{"n":238350,"d":"Cabinet Refacing","s":"NC","y":2020,"r":824679,"e":104928,"m":3.96},{"n":238110,"d":"Outdoor Hardscapes and High End Pools Contractor","s":"TN","y":2020,"r":3058934,"e":482800,"m":2.89},{"n":423390,"d":"Distributor of Metal Based Products and Accessories for the Construction Industr","s":"","y":2020,"r":1633091,"e":821606,"m":1.95},{"n":449129,"d":"Art Framing Services","s":"FL","y":2020,"r":526674,"e":107977,"m":2.18},{"n":238990,"d":"Fireplace and Hot Tub Installation","s":"BC","y":2020,"r":1436493,"e":230229,"m":3.26},{"n":238210,"d":"Electrical Contractor","s":"TX","y":2020,"r":710717,"e":391220,"m":1.53},{"n":238220,"d":"Residential Plumbing Contractor","s":"FL","y":2020,"r":379084,"e":39214,"m":1.15},{"n":561730,"d":"Full-Service Lawn and Landscape Maintenance and Installation Company","s":"VA","y":2020,"r":1017950,"e":110762,"m":2.26},{"n":561730,"d":"Commercial Lawn and Landscaping Company","s":"FL","y":2020,"r":1772655,"e":311729,"m":3.42},{"n":238150,"d":"Commercial Glass Company","s":"TX","y":2020,"r":7187240,"e":1197170,"m":1.75},{"n":238150,"d":"Specialty Glass Contractor","s":"FL","y":2020,"r":758024,"e":139191,"m":2.16},{"n":238910,"d":"Directional Drilling Contractor for Utilities and Telecommunications","s":"WI","y":2020,"r":3241616,"e":910905,"m":4.35},{"n":238190,"d":"Miscellaneous Light Metals Fabrication and Erection","s":"PA","y":2020,"r":258478,"e":29223,"m":3.85},{"n":337110,"d":"Cabinets Contractor","s":"WI","y":2020,"r":1530453,"e":352964,"m":2.55},{"n":238220,"d":"Residential and Commercial HVAC Business","s":"SC","y":2020,"r":5361208,"e":880583,"m":3.49},{"n":238210,"d":"Electrical Contractor for Maintenance and Installation","s":"DC","y":2020,"r":1533588,"e":241361,"m":1.86},{"n":238220,"d":"Plumbing Service and Repair","s":"TX","y":2020,"r":1067430,"e":130332,"m":2.11},{"n":444110,"d":"Lumber and Building Materials Retailer","s":"MA","y":2020,"r":5354145,"e":599425,"m":3.34},{"n":238130,"d":"Custom Picture Framing Services","s":"","y":2020,"r":321822,"e":87844,"m":0.37},{"n":236118,"d":"Franchised Company providing Clean-Up and Restoration of Residential and Commerc","s":"NC","y":2020,"r":1522237,"e":345621,"m":2.57},{"n":238990,"d":"Specialty Trade Contractor","s":"CA","y":2020,"r":6032593,"e":209457,"m":5.73},{"n":238210,"d":"Installer of Solar Systems","s":"CO","y":2019,"r":1804877,"e":517619,"m":1.64},{"n":238160,"d":"Roofing and Insulation Contractor","s":"MN","y":2019,"r":2285857,"e":378734,"m":4.36},{"n":561740,"d":"Tiled Floor and Grout Cleaning, Sealing, Recoloring, and Renovation","s":"FL","y":2019,"r":213509,"e":54864,"m":2.73},{"n":238990,"d":"Fencing Company","s":"OR","y":2019,"r":1005971,"e":237387,"m":1.9},{"n":238990,"d":"Installation, Sales and Maintenance of Artificial Grass Products for Residential","s":"ID","y":2019,"r":380799,"e":93292,"m":1.93},{"n":238390,"d":"Metal Fabrication Services","s":"TX","y":2019,"r":341149,"e":50000,"m":2.6},{"n":339950,"d":"Manufacturer of Aluminum Traffic Signs, Road Construction Material and Signs for","s":"IN","y":2019,"r":5950000,"e":82800,"m":15.58},{"n":238220,"d":"Commercial Refrigeration Equipment Installation and Maintenance","s":"CA","y":2019,"r":7007800,"e":1109628,"m":3.06},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning Contract Services","s":"FL","y":2019,"r":1330749,"e":200787,"m":2.96},{"n":238220,"d":"Provider of Maintenance, Service and Installation of New and Retrofit HVAC Syste","s":"FL","y":2019,"r":2650584,"e":337953,"m":2.43},{"n":236117,"d":"Residential Home Designing and Construction","s":"CO","y":2019,"r":22298561,"e":2322919,"m":2.15},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) (85% Residential and 15% Comme","s":"FL","y":2019,"r":572329,"e":213500,"m":1.41},{"n":238220,"d":"Fire Extinguishing Systems Installation","s":"UT","y":2019,"r":763965,"e":147777,"m":2.71},{"n":444140,"d":"Retail Hardware and Lumber","s":"VT","y":2019,"r":4842183,"e":340308,"m":3.17},{"n":561790,"d":"Provider of Swimming Pool Renovation and Repair Services for Commercial and Resi","s":"FL","y":2019,"r":725708,"e":270335,"m":0.74},{"n":561622,"d":"Locksmith and Glass Repair Contractor","s":"NV","y":2019,"r":907222,"e":160650,"m":2.35},{"n":238220,"d":"Residential and Commercial A/C & Heating Contractor","s":"FL","y":2019,"r":3645261,"e":446175,"m":2.58},{"n":238150,"d":"Glazing Contractor","s":"CA","y":2019,"r":7435202,"e":1346801,"m":2.23},{"n":238990,"d":"Hearth Sales and Installation","s":"BC","y":2019,"r":2111755,"e":122763,"m":5.38},{"n":238220,"d":"Plumbing Contractor","s":"QC","y":2019,"r":7900000,"e":715000,"m":6.01},{"n":238320,"d":"Painting Contractor","s":"VA","y":2019,"r":1269979,"e":345274,"m":1.45},{"n":238330,"d":"Retailer and Installer of Hardwood Floors","s":"FL","y":2019,"r":971896,"e":165740,"m":4.07},{"n":238210,"d":"Commercial Electrical Contractor","s":"TX","y":2019,"r":1752423,"e":414125,"m":1.45},{"n":236210,"d":"Construction Builder","s":"MN","y":2019,"r":2531878,"e":806527,"m":3.35},{"n":238220,"d":"Residential, Remodeling, and New Construction Plumbing Services","s":"FL","y":2019,"r":5562262,"e":792980,"m":3.4},{"n":541990,"d":"Fire Protection Equipment Inspection, Maintenance, and Installation","s":"NY","y":2019,"r":14068018,"e":2622560,"m":13.35},{"n":238210,"d":"Provider of Residential and Commercial Electrical Contract Services","s":"FL","y":2019,"r":587293,"e":65030,"m":2.15},{"n":238990,"d":"Fence and Deck Contractor","s":"TX","y":2019,"r":1309387,"e":132734,"m":2.7},{"n":459920,"d":"Art and Framing Gallery","s":"SD","y":2019,"r":632158,"e":91785,"m":1.42},{"n":238310,"d":"Regional Distribution and Installation of Innovative Building Products for Weath","s":"","y":2019,"r":240608,"e":59987,"m":1.7},{"n":238320,"d":"Residential and Commercial Painting Contractor","s":"FL","y":2019,"r":587199,"e":118924,"m":2.1},{"n":238220,"d":"Residential and Commercial Heating, Ventilation, and Air Conditioning (HVAC) Con","s":"AR","y":2019,"r":1885831,"e":453000,"m":1.99},{"n":238220,"d":"Commercial Heating Ventilation and Air Conditionings (HVAC) Contractor","s":"AZ","y":2019,"r":24665012,"e":3965762,"m":2.77},{"n":238220,"d":"Residential Plumbing Services","s":"FL","y":2019,"r":445302,"e":72500,"m":2.76},{"n":561730,"d":"Offers Full Service Residential and Commercial Landscaping","s":"FL","y":2019,"r":2195035,"e":355162,"m":1.83},{"n":238220,"d":"Provider of HVAC Services to 70% Residential and 30% Commercial Accounts","s":"FL","y":2019,"r":1446472,"e":222147,"m":1.35},{"n":238220,"d":"Residential Heating and Air Conditioning Contractor","s":"MI","y":2019,"r":1550767,"e":203498,"m":3.32},{"n":561730,"d":"Provider of Lawn and Landscaping Services","s":"FL","y":2019,"r":55709,"e":28104,"m":1.78},{"n":561730,"d":"Offers Full Services Residential Landscaping","s":"FL","y":2019,"r":119388,"e":21406,"m":2.76},{"n":236220,"d":"Construction and Paving Services","s":"FL","y":2019,"r":1273779,"e":362409,"m":2.41},{"n":238990,"d":"Installer of Home Automation, Security, Lighting Control and Home Theaters","s":"PA","y":2019,"r":1483478,"e":466284,"m":2.73},{"n":238330,"d":"Floor Laying Contractors for Porcelain Tile, Stone and Wood Flooring","s":"FL","y":2019,"r":1648149,"e":624351,"m":3.59},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Services","s":"FL","y":2019,"r":3960524,"e":1372181,"m":3.31},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Services","s":"FL","y":2019,"r":1720910,"e":87471,"m":8.57},{"n":532289,"d":"Party Goods, Catering Equipment, Tents, Tables, Inflatables, Construction Equipm","s":"MA","y":2019,"r":469801,"e":125077,"m":1.05},{"n":238220,"d":"Air Conditioning Contractor","s":"TX","y":2019,"r":1105855,"e":266314,"m":2.63},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Services","s":"FL","y":2019,"r":1235264,"e":184550,"m":2.17},{"n":449122,"d":"Provider of Window Tinting Services for Vehicles and Commercial and Residential ","s":"FL","y":2019,"r":10895,"e":19333,"m":7.24},{"n":238210,"d":"Electrical Contractor","s":"SC","y":2019,"r":928176,"e":131048,"m":0.53},{"n":333120,"d":"Vacuum Excavator Manufacturing","s":"CA","y":2019,"r":2267269,"e":227850,"m":2.68},{"n":238220,"d":"Residential and Commercial Heating, Ventilation, and Air Conditioning (HVAC) Ser","s":"FL","y":2019,"r":1051318,"e":149836,"m":2.5},{"n":449210,"d":"Retail and Installation of Custom Home Theaters, Home Automation, Lighting Contr","s":"FL","y":2019,"r":3554298,"e":232490,"m":3.23},{"n":561730,"d":"Landscaping Company","s":"BC","y":2019,"r":190818,"e":82570,"m":0.79},{"n":561730,"d":"Provider of Landscaping Maintenance and Design to Commercial and Residential Cli","s":"SC","y":2019,"r":1367139,"e":245788,"m":0.73},{"n":238150,"d":"Manufacturer of Products and Accessories for Specialty and Tobacco Shops","s":"NH","y":2019,"r":406000,"e":156000,"m":0.8},{"n":238210,"d":"Provider of Landscape Lighting as well as Interior/Exterior Christmas Light Inst","s":"TX","y":2019,"r":419100,"e":91000,"m":2.2},{"n":811111,"d":"Automotive Repair Shop Catering to Small, Construction-Related Trucks Fleets","s":"FL","y":2019,"r":1739056,"e":254052,"m":1.97},{"n":238210,"d":"Electrical Contractor","s":"UT","y":2019,"r":1800000,"e":750000,"m":1.67},{"n":236118,"d":"Home Based Provider of Rescreening and Repair or Pool Cages and Lanais","s":"FL","y":2019,"r":627452,"e":282614,"m":0.8},{"n":449129,"d":"Art Framing Shop","s":"FL","y":2019,"r":711343,"e":129761,"m":2.31},{"n":561730,"d":"Commercial and Residential Landscaping and Maintenance Services Working with Dev","s":"FL","y":2019,"r":4062628,"e":248670,"m":3.12},{"n":561730,"d":"Provides Landscaping and Maintenance Services Including Ground, Trees, and Pest ","s":"FL","y":2019,"r":4062628,"e":204204,"m":3.8},{"n":561730,"d":"Commercial and Residential Landscaping and Maintenance Services Working with Dev","s":"FL","y":2019,"r":4062628,"e":248670,"m":3.12},{"n":236118,"d":"Provider of General Contractor Services for Kitchen and Bath","s":"CA","y":2019,"r":965909,"e":339356,"m":1.03},{"n":238210,"d":"Full Service Commercial Electrical Contractor","s":"VI","y":2019,"r":470762,"e":153009,"m":2.03},{"n":561790,"d":"Civil Site Development","s":"FL","y":2019,"r":4084823,"e":710982,"m":3.02},{"n":238990,"d":"Commercial Concrete Polishing (Home-Based Business)","s":"MO","y":2019,"r":689983,"e":252260,"m":1.53},{"n":238310,"d":"Home Based Interior Finish Contractor for Drywall Installation","s":"NE","y":2019,"r":469595,"e":186421,"m":0.62},{"n":238150,"d":"Residential Window and Siding Company","s":"VI","y":2019,"r":2089096,"e":206532,"m":2.71},{"n":238160,"d":"Commercial Roofing Contractor","s":"MA","y":2019,"r":2520040,"e":675222,"m":1.56},{"n":332322,"d":"Sheet Metal Work Manufacturer","s":"MA","y":2019,"r":1286622,"e":437658,"m":2.63},{"n":238210,"d":"Electrical Contracting","s":"CO","y":2019,"r":2263742,"e":568204,"m":2.82},{"n":238350,"d":"Manufacture of Custom Wood Cabinet Doors","s":"FL","y":2019,"r":791042,"e":85928,"m":3.96},{"n":236118,"d":"Home Improvement Contractor","s":"MI","y":2019,"r":1000000,"e":100000,"m":3.0},{"n":238220,"d":"HVAC Business","s":"FL","y":2019,"r":871244,"e":116838,"m":2.44},{"n":238220,"d":"Residential Heating, Ventilation, and Air Conditioning (HVAC) Services","s":"FL","y":2019,"r":866522,"e":52420,"m":5.44},{"n":238290,"d":"Full service Custom Window, Door, and Shutter Company","s":"FL","y":2019,"r":13007229,"e":2437515,"m":2.67},{"n":238210,"d":"Installation of Security Systems","s":"SC","y":2019,"r":121471,"e":17783,"m":9.51},{"n":238220,"d":"Commercial Heating, Ventilation, and Air Conditioning (HVAC) Contracting Company","s":"AZ","y":2019,"r":6559298,"e":1173106,"m":3.41},{"n":333514,"d":"Sheet Metal Stamping Die Manufacturer","s":"MI","y":2019,"r":17341485,"e":4197097,"m":3.1},{"n":238150,"d":"Glass and Glazing Contractor","s":"OR","y":2019,"r":1470165,"e":148705,"m":4.2},{"n":237130,"d":"Telephone and Communication Line Construction","s":"SC","y":2019,"r":2758729,"e":1135798,"m":0.98},{"n":238170,"d":"Gutter Installation, Repair and Cleaning Service","s":"MD","y":2019,"r":486003,"e":108515,"m":1.07},{"n":238210,"d":"Telecommunications Hardware Infrastructure Installation Company","s":"ON","y":2019,"r":2100000,"e":333000,"m":2.81},{"n":532490,"d":"Rental of Scaffolding Equipment","s":"MA","y":2019,"r":1262995,"e":177832,"m":2.53},{"n":238150,"d":"Distribution and Manufacturing of Glass and Mirrors","s":"FL","y":2019,"r":1903489,"e":759984,"m":0.92},{"n":238350,"d":"Counter Top Manufacturer","s":"FL","y":2019,"r":610084,"e":80349,"m":4.42},{"n":238170,"d":"Rain Gutter and Siding Installation","s":"NV","y":2019,"r":151217,"e":48257,"m":1.35},{"n":238210,"d":"Electrical Contractor Serving Commercial Clients","s":"LA","y":2019,"r":1538777,"e":367357,"m":2.72},{"n":238220,"d":"Provider of Services and Repair for HVAC, Refrigeration and Ice Making Machines","s":"AZ","y":2019,"r":730821,"e":240970,"m":1.49},{"n":238210,"d":"Electrical Engineering Services","s":"CA","y":2019,"r":439847,"e":294738,"m":0.61},{"n":237110,"d":"Residential, Commercial, Agricultural, Geothermal, and Elevator Shafts Drilling","s":"FL","y":2019,"r":2099479,"e":755556,"m":2.78},{"n":238220,"d":"Residential and Commercial Plumbing and HVAC Services","s":"CO","y":2019,"r":2184123,"e":684379,"m":1.68},{"n":238350,"d":"Installation of Shutters, Windows, and Doors","s":"FL","y":2019,"r":15962681,"e":2018508,"m":2.01},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractors","s":"NC","y":2019,"r":957930,"e":378092,"m":1.06},{"n":238220,"d":"Commercial Plumbing Services","s":"AUK","y":2019,"r":2635176,"e":438513,"m":3.21},{"n":238220,"d":"Plumbing Company Specializing in Gas Pipe Installation, Septic Tank Services, an","s":"CO","y":2019,"r":1725418,"e":619836,"m":1.53},{"n":423720,"d":"Commercial and Industrial Plumbing Supply Company","s":"NC","y":2019,"r":2567391,"e":343227,"m":3.64},{"n":561730,"d":"Lawn and Landscaping Services","s":"FL","y":2019,"r":5000000,"e":985000,"m":2.99},{"n":561730,"d":"Provides Landscaping Services to Residential, Commercial, Environmental, and Pub","s":"FL","y":2019,"r":4031869,"e":601221,"m":4.91},{"n":561730,"d":"Offers Full Service Residential Landscaping Services","s":"FL","y":2019,"r":377096,"e":91351,"m":3.12},{"n":238210,"d":"Residential Electrical Contractor","s":"FL","y":2019,"r":747846,"e":231913,"m":2.16},{"n":236118,"d":"Kitchen and Bathroom Design and Remodeling","s":"BC","y":2019,"r":1659762,"e":191677,"m":1.54},{"n":561730,"d":"Landscaping Company","s":"FL","y":2019,"r":1119565,"e":359047,"m":0.45},{"n":238210,"d":"Electrical Contractor","s":"RI","y":2019,"r":5677686,"e":282303,"m":1.33},{"n":237130,"d":"Cell Tower Construction and Technology","s":"VA","y":2019,"r":3042622,"e":804171,"m":3.61},{"n":238990,"d":"Construction and Remodeling of, Pools, Patio Decks, Screen Enclosures, Water Fea","s":"FL","y":2019,"r":15955125,"e":1874800,"m":2.24},{"n":236118,"d":"Home Remodeling and Renovation Company","s":"TN","y":2019,"r":871068,"e":136201,"m":0.76},{"n":561730,"d":"Residential and Commercial Landscaping Services","s":"FL","y":2019,"r":111401,"e":34733,"m":3.02},{"n":238140,"d":"Construction of Brick, Block or Stone Building","s":"CO","y":2019,"r":7709442,"e":1602011,"m":2.37},{"n":236115,"d":"New Single Family and Duplex Construction","s":"CO","y":2019,"r":12152112,"e":597839,"m":1.09},{"n":423320,"d":"Brick, Stone, and Related Construction Materials Merchant Wholesaler","s":"OH","y":2019,"r":10539210,"e":1035000,"m":3.4},{"n":238160,"d":"Roofing Contractor","s":"CO","y":2019,"r":1890242,"e":218007,"m":2.29},{"n":561730,"d":"Commercial Landscape Maintenance Services","s":"CA","y":2019,"r":321309,"e":98168,"m":1.22},{"n":238160,"d":"Provider of Repairs and Installation of Roofing and Other Building Exterior for ","s":"OK","y":2019,"r":1799637,"e":235904,"m":3.6},{"n":236115,"d":"Provider of Kitchen and Bath Remodeling Services focusing on Cabinetry and Count","s":"TN","y":2019,"r":224827,"e":70282,"m":1.21},{"n":238220,"d":"Full Service Plumbing","s":"FL","y":2019,"r":2130508,"e":453476,"m":2.43},{"n":238990,"d":"Installer of Concrete Curbs, Gutters, Sidewalks and Driveways","s":"SC","y":2019,"r":1738500,"e":255452,"m":2.64},{"n":238210,"d":"Electrical Contracting","s":"ON","y":2019,"r":2410202,"e":304882,"m":2.13},{"n":238910,"d":"Excavation and Grading Services","s":"WI","y":2019,"r":6872852,"e":701526,"m":3.14},{"n":238390,"d":"Metal Fabrication and Engineering Consulting","s":"MI","y":2019,"r":1411661,"e":267262,"m":1.68},{"n":238220,"d":"HVAC Company (75% Residential, 25% Commercial)","s":"FL","y":2019,"r":696940,"e":181125,"m":1.98},{"n":424910,"d":"Agriculture and Construction Supply Wholesaler","s":"CA","y":2019,"r":3411143,"e":484513,"m":2.99},{"n":237990,"d":"Provider of Horizontal Drilling Services","s":"CO","y":2019,"r":1134027,"e":524098,"m":2.1},{"n":423310,"d":"Distributor of Building Materials to Commercial General Contractors","s":"FL","y":2019,"r":1856708,"e":194810,"m":2.69},{"n":238150,"d":"Window and Door Contractor","s":"FL","y":2019,"r":5680652,"e":146693,"m":4.91},{"n":238210,"d":"Electrical Contractor","s":"WA","y":2019,"r":3505216,"e":505675,"m":2.57},{"n":236118,"d":"Residential Remodeler and Custom Home Builder","s":"FL","y":2019,"r":7380671,"e":944316,"m":1.74},{"n":238160,"d":"Provider of Roofing, Gutter, Window and Siding Services","s":"CO","y":2019,"r":1877999,"e":253724,"m":1.18},{"n":561730,"d":"Provider of Landscaping Services","s":"CO","y":2019,"r":1468032,"e":666979,"m":2.17},{"n":238140,"d":"Masonry Contractor","s":"QC","y":2019,"r":22220000,"e":2026000,"m":7.77},{"n":236118,"d":"Handyman Services (80% Residential, 20% Commercial) (Home-Based Business)","s":"AZ","y":2019,"r":616000,"e":125000,"m":1.84},{"n":237310,"d":"Asphalt Parking Lot Paving","s":"VA","y":2019,"r":1283414,"e":290199,"m":2.5},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"WA","y":2019,"r":3812006,"e":887675,"m":2.28},{"n":238210,"d":"Low Voltage Electrical Contractor","s":"FL","y":2019,"r":800395,"e":308019,"m":2.92},{"n":238220,"d":"HVAC Company","s":"FL","y":2019,"r":328527,"e":156088,"m":0.7},{"n":561730,"d":"Interior Landscaping Company (Provides Plant Leasing and Maintenance)","s":"FL","y":2019,"r":87820,"e":46732,"m":1.39},{"n":238220,"d":"Provider of Plumbing Services","s":"FL","y":2019,"r":250000,"e":75000,"m":6.47},{"n":456199,"d":"Provides Medical Equipment and Construction Services to Modify Homes for Handica","s":"FL","y":2019,"r":2043856,"e":275278,"m":1.81},{"n":238220,"d":"Provides HVAC Service, Lawn Care, and Property Management on the Island of Saba","s":"","y":2019,"r":258004,"e":64558,"m":1.24},{"n":238220,"d":"Provider of Plumbing and Heating Installation Service and Repairs","s":"CO","y":2019,"r":349763,"e":144129,"m":0.52},{"n":238220,"d":"Provider of Maintenance, Service and Installation of New HVAC Systems","s":"FL","y":2019,"r":580416,"e":187134,"m":0.32},{"n":238990,"d":"Custom Stone Fabricator and Installer","s":"CO","y":2019,"r":2553592,"e":369625,"m":2.63},{"n":238330,"d":"Franchised Provider of Garage Organization and Renovation Services and Floor Cov","s":"DE","y":2019,"r":490878,"e":75437,"m":2.45},{"n":325199,"d":"Manufacturer of Chemicals for Aviation Industry and Commercial HVAC Equipment","s":"NY","y":2019,"r":696599,"e":219930,"m":2.25},{"n":236118,"d":"Remodeling, Building Maintenance and Repair, Landscape Maintenance, Handyman Rep","s":"ID","y":2019,"r":1053488,"e":199896,"m":1.5},{"n":423720,"d":"Wholesaler of Plumbing and Heating Ventilation and Air Conditioning (HVAC) Suppl","s":"IA","y":2019,"r":17000000,"e":2900000,"m":2.59},{"n":238390,"d":"Residential Waterproofing","s":"CA","y":2019,"r":1504000,"e":360000,"m":1.77},{"n":238160,"d":"Commercial and Residential Roofing Contractor","s":"FL","y":2019,"r":462661,"e":267954,"m":0.84},{"n":238170,"d":"Gutter Installation Services","s":"CA","y":2019,"r":313122,"e":75472,"m":1.99},{"n":238210,"d":"Commercial, Residential, and Industrial Electrical Contractors (60% Commercial, ","s":"","y":2019,"r":100000000,"e":12500000,"m":2.08},{"n":238220,"d":"Facilities Operations and Preventive Maintenance for Commercial Buildings","s":"CO","y":2019,"r":1066274,"e":325932,"m":2.68},{"n":522299,"d":"Provides Factoring Contractor Invoice Services","s":"WA","y":2019,"r":1595884,"e":335883,"m":3.5},{"n":423840,"d":"Wholesale Distributor of Water and Gas Pipeline Repair Materials","s":"UT","y":2019,"r":1651928,"e":174625,"m":1.43},{"n":238330,"d":"Flooring Contractor","s":"SC","y":2019,"r":426401,"e":44000,"m":0.91},{"n":238910,"d":"Excavating Services Company","s":"ON","y":2019,"r":1028400,"e":370000,"m":3.92},{"n":238330,"d":"Flooring Supply and Installation","s":"TX","y":2019,"r":1300000,"e":324000,"m":1.7},{"n":332919,"d":"Manufacture and Distributor of Sheet Metal Products, HVAC Supplies, and Pipe and","s":"OH","y":2019,"r":4498421,"e":288643,"m":3.91},{"n":238210,"d":"Sells, Installs, and Services Generators and Provides Electrical Work for Reside","s":"VA","y":2019,"r":1271328,"e":246675,"m":2.33},{"n":236118,"d":"Provider of Remodeling and Renovation Services","s":"VA","y":2019,"r":567790,"e":120353,"m":1.16},{"n":423610,"d":"Commercial Building Lighting Supplier","s":"ON","y":2019,"r":3469208,"e":993183,"m":4.53},{"n":238220,"d":"Plumbing Contractor","s":"MO","y":2019,"r":3725563,"e":787698,"m":3.11},{"n":238110,"d":"Sand, Gravel and Ready Mix Company","s":"MT","y":2019,"r":3489936,"e":1028770,"m":1.28},{"n":238220,"d":"Plumbing Business","s":"FL","y":2019,"r":893626,"e":247877,"m":1.55},{"n":561730,"d":"Provider of Commercial and Residential Landscaping Services","s":"MA","y":2019,"r":2771316,"e":355159,"m":4.7},{"n":561730,"d":"Commercial and Residential Landscaping Business","s":"FL","y":2019,"r":1313624,"e":283111,"m":2.3},{"n":561730,"d":"Landscaping Services","s":"TX","y":2019,"r":686140,"e":200221,"m":2.75},{"n":457210,"d":"Distributor of Heating Oil and Heating, Ventilation, and Air Conditioning (HVAC)","s":"PA","y":2019,"r":1614000,"e":441000,"m":1.03},{"n":236118,"d":"Handyman Services Franchise","s":"NV","y":2019,"r":300000,"e":143000,"m":0.87},{"n":238220,"d":"Gas Line, Individual Hookup Contractors","s":"FL","y":2019,"r":1896175,"e":800420,"m":2.75},{"n":238330,"d":"Flooring Contractor","s":"MD","y":2019,"r":421877,"e":60000,"m":1.38},{"n":237990,"d":"Provider of Horizontal Drilling Services","s":"CO","y":2019,"r":439255,"e":263379,"m":2.53},{"n":238910,"d":"Septic System Installation and Site Preparation","s":"SD","y":2019,"r":535635,"e":210985,"m":3.55},{"n":238390,"d":"Fabrication of Metal for the Trades","s":"MI","y":2019,"r":704225,"e":172053,"m":2.76},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"FL","y":2019,"r":690993,"e":157506,"m":2.42},{"n":238290,"d":"Industrial Door Installation","s":"ON","y":2019,"r":891061,"e":171814,"m":2.91},{"n":238990,"d":"Installer and Construction of Marine Based Structures","s":"FL","y":2019,"r":5119755,"e":1425320,"m":2.81},{"n":236118,"d":"Bathroom Remodeling Franchise","s":"FL","y":2019,"r":1654495,"e":340053,"m":1.18},{"n":238220,"d":"HVAC Company","s":"FL","y":2019,"r":2400000,"e":447600,"m":1.56},{"n":561730,"d":"Provides General Landscaping, Lawn Maintenance, Sprinklers and Tree Trimming Ser","s":"FL","y":2019,"r":1308257,"e":512409,"m":1.94},{"n":238160,"d":"Provider of Roofing, Siding and Gutter Repair and Installation","s":"CO","y":2019,"r":1180201,"e":514088,"m":0.58},{"n":238990,"d":"Artificial Turf Installation","s":"RI","y":2019,"r":558724,"e":175145,"m":1.0},{"n":238290,"d":"Mechanical, Electrical, and Structural Contractor","s":"FL","y":2019,"r":7974710,"e":629846,"m":2.54},{"n":236210,"d":"Commercial Construction Contractor","s":"FL","y":2019,"r":2146356,"e":156824,"m":2.55},{"n":541320,"d":"Provider of Lawn and Landscaping Design Services","s":"CO","y":2019,"r":550453,"e":117775,"m":1.87},{"n":561730,"d":"Lawn Maintenance and Landscaping","s":"GA","y":2019,"r":1051318,"e":133692,"m":2.06},{"n":238210,"d":"Installer of Fiber Optic Cables","s":"CA","y":2019,"r":2904929,"e":1652525,"m":1.51},{"n":424710,"d":"Distributor of Petroleum and Heating and Air-Conditioning Equipment","s":"PA","y":2019,"r":2793000,"e":285000,"m":1.77},{"n":238150,"d":"Commercial Glass and Door Installer","s":"IA","y":2019,"r":6939900,"e":880000,"m":5.23},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"FL","y":2019,"r":207102,"e":53789,"m":1.64},{"n":423310,"d":"Distributor of Specialty Construction Material","s":"ON","y":2019,"r":5237818,"e":426575,"m":3.48},{"n":238220,"d":"HVAC Company","s":"FL","y":2019,"r":2550916,"e":490844,"m":2.8},{"n":444110,"d":"Retailer and Installer of Building Materials","s":"MI","y":2019,"r":1100000,"e":100000,"m":3.48},{"n":238390,"d":"Franchised Designer and Installer of Custom Storage Solutions","s":"DE","y":2019,"r":300000,"e":12000,"m":12.5},{"n":238220,"d":"Heating and Air-Conditioning Contractor (60% Residential and 40% Commercial Serv","s":"WI","y":2019,"r":1908810,"e":532615,"m":1.8},{"n":236118,"d":"Residential Remodeler","s":"FL","y":2019,"r":3477000,"e":550000,"m":2.53},{"n":238320,"d":"Provider of Painting and Protective Coating Services","s":"CO","y":2018,"r":874664,"e":347067,"m":2.16},{"n":238220,"d":"HVAC Contractor","s":"ID","y":2018,"r":1014243,"e":116297,"m":2.84},{"n":238220,"d":"HVAC Contractor","s":"SC","y":2018,"r":2087811,"e":233662,"m":3.96},{"n":238220,"d":"HVAC Contractor","s":"TX","y":2018,"r":2367265,"e":790305,"m":3.42},{"n":238390,"d":"Commercial Window Treatment Installation Contractors","s":"CA","y":2018,"r":2124360,"e":1524721,"m":1.87},{"n":561730,"d":"Landscape Mantainence","s":"NV","y":2018,"r":310773,"e":120700,"m":0.66},{"n":238330,"d":"Carpet Repair, Installation, Tools and Supplies","s":"FL","y":2018,"r":427453,"e":120392,"m":1.33},{"n":238330,"d":"Flooring Contractor","s":"PA","y":2018,"r":415859,"e":23868,"m":5.24},{"n":238310,"d":"Insulation Contractor","s":"OR","y":2018,"r":1092060,"e":189280,"m":1.47},{"n":238220,"d":"HVAC Business","s":"FL","y":2018,"r":599624,"e":112682,"m":1.33},{"n":236115,"d":"General Construction Contractor","s":"FL","y":2018,"r":5049954,"e":528790,"m":2.65},{"n":238220,"d":"HVAC Contractor","s":"TX","y":2018,"r":5205967,"e":803811,"m":3.23},{"n":238220,"d":"HVAC Company","s":"TX","y":2018,"r":5205967,"e":803811,"m":3.23},{"n":238350,"d":"Sells and Installs Cabinets and Counter Tops","s":"FL","y":2018,"r":1589249,"e":236592,"m":1.05},{"n":238170,"d":"Seamless Rain Gutter Installation","s":"SD","y":2018,"r":537731,"e":178574,"m":2.13},{"n":238220,"d":"HVAC Company","s":"FL","y":2018,"r":254600,"e":141751,"m":0.53},{"n":238320,"d":"Commercial/Institutional Painting Services Company","s":"ON","y":2018,"r":4031000,"e":1142965,"m":2.84},{"n":238210,"d":"Installs Mobile Specialty Systems","s":"","y":2018,"r":8640000,"e":300000,"m":5.67},{"n":238220,"d":"Commercial Plumbing Contractor","s":"QC","y":2018,"r":2950000,"e":530000,"m":2.08},{"n":238320,"d":"Painting Contractor","s":"ON","y":2018,"r":4031000,"e":1142965,"m":2.84},{"n":561730,"d":"Landscaping Contractor","s":"NC","y":2018,"r":2613235,"e":911967,"m":2.74},{"n":561790,"d":"Home Improvement Contractor","s":"IN","y":2018,"r":985250,"e":277250,"m":2.2},{"n":531120,"d":"Commercial Building","s":"FL","y":2018,"r":1625199,"e":82078,"m":0.61},{"n":238220,"d":"Air Conditioning and Heating Service","s":"FL","y":2018,"r":4845963,"e":854016,"m":4.1},{"n":238350,"d":"Provider of Aluminum Material Installation for Screens, Windows, Carports and Ot","s":"FL","y":2018,"r":262661,"e":34240,"m":2.77},{"n":238220,"d":"Plumbing Company","s":"OH","y":2018,"r":409917,"e":91370,"m":2.35},{"n":238310,"d":"Drywall, Framing, Concrete, and Masonry Contractor","s":"FL","y":2018,"r":5820108,"e":537685,"m":2.23},{"n":236220,"d":"Protective Coatings Contractor Franchise","s":"WA","y":2018,"r":145831,"e":78379,"m":0.96},{"n":457210,"d":"Full-Service Fuel Dealer and Heating, Ventilation, and Air-Conditioning (HVAC) C","s":"PA","y":2018,"r":3542000,"e":417000,"m":2.88},{"n":237990,"d":"Marine Dock and Lift Construction Company","s":"FL","y":2018,"r":2146794,"e":267192,"m":2.81},{"n":423720,"d":"Wholesale Plumbing Supply Business","s":"FL","y":2018,"r":1875000,"e":82441,"m":1.06},{"n":238350,"d":"Custom Design and Installation of Closets and Glass","s":"BC","y":2018,"r":1140919,"e":124529,"m":4.42},{"n":561730,"d":"Landscaping Services","s":"QLD","y":2018,"r":4380133,"e":300251,"m":4.78},{"n":238110,"d":"Concrete Chipping Services","s":"IN","y":2018,"r":2285767,"e":631884,"m":2.53},{"n":238220,"d":"Plumbing Contractor","s":"GA","y":2018,"r":746000,"e":199000,"m":2.46},{"n":238350,"d":"Cabinetry and Countertop Sales and Installation Business","s":"FL","y":2018,"r":4953347,"e":893144,"m":2.46},{"n":238140,"d":"Masonry Contractors","s":"FL","y":2018,"r":835191,"e":217964,"m":2.16},{"n":236118,"d":"Provider of Remodeling Services for Kitchen and Bath","s":"CA","y":2018,"r":2378000,"e":244028,"m":0.68},{"n":238150,"d":"Installer of Glass Panes","s":"CO","y":2018,"r":622207,"e":198124,"m":2.65},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2018,"r":4787781,"e":944470,"m":1.69},{"n":237110,"d":"Pipeline Maintenance Service","s":"UT","y":2018,"r":574108,"e":167900,"m":4.02},{"n":238220,"d":"Plumbing Company (87% Residential Service, 13% Commercial Service)","s":"MA","y":2018,"r":762157,"e":251000,"m":1.53},{"n":238220,"d":"HVAC Contractor","s":"MO","y":2018,"r":616840,"e":162102,"m":1.85},{"n":449129,"d":"Custom Framing Shop","s":"CO","y":2018,"r":228606,"e":110305,"m":1.62},{"n":238220,"d":"Air Conditioning and Heating Service","s":"FL","y":2018,"r":579401,"e":195834,"m":1.66},{"n":449129,"d":"Photo Framing and Printing Shop","s":"PA","y":2018,"r":122285,"e":45529,"m":0.55},{"n":238170,"d":"Gutter Sales and Installation Company","s":"FL","y":2018,"r":451950,"e":109096,"m":2.06},{"n":238220,"d":"Air Conditioning and Heating Business (home-based business)","s":"FL","y":2018,"r":357403,"e":120542,"m":0.91},{"n":423320,"d":"Supplier of Fill Material and Other Natural Earth Products for Highway, Commerci","s":"FL","y":2018,"r":41236755,"e":2402613,"m":2.0},{"n":236118,"d":"Residential Remodeling Company","s":"CA","y":2018,"r":3693760,"e":1031205,"m":1.96},{"n":561730,"d":"Commercial Landscape Services","s":"NC","y":2018,"r":1966994,"e":320279,"m":2.5},{"n":238160,"d":"Commercial and Industrial Roofing Contractor","s":"FL","y":2018,"r":1233814,"e":184049,"m":1.79},{"n":238210,"d":"Electrical Contractor to Industrial and Commercial Clients","s":"PA","y":2018,"r":19335300,"e":3363988,"m":5.43},{"n":238990,"d":"Paving Contractor","s":"CA","y":2018,"r":10162773,"e":1323245,"m":2.72},{"n":238220,"d":"HVAC Contractor","s":"WA","y":2018,"r":2796968,"e":482956,"m":2.69},{"n":238290,"d":"Warehousing Equipment Installation Contractor","s":"SC","y":2018,"r":1900087,"e":406344,"m":2.8},{"n":444230,"d":"Landscape Equipment Sales and Service","s":"FL","y":2018,"r":4072156,"e":617785,"m":3.04},{"n":444180,"d":"Lumber and Building Materials Distributor","s":"SC","y":2018,"r":49216000,"e":2619500,"m":3.34},{"n":238190,"d":"Restoration Contractor","s":"NC","y":2018,"r":6273530,"e":1430708,"m":3.41},{"n":238990,"d":"Pool and Spa Contractor","s":"TX","y":2018,"r":770963,"e":63454,"m":3.15},{"n":561730,"d":"Landscaping Business","s":"OH","y":2018,"r":1390272,"e":448031,"m":3.29},{"n":238350,"d":"Manufacturer and Installer of Cabinets","s":"FL","y":2018,"r":1296253,"e":435631,"m":1.15},{"n":238220,"d":"Plumbing Contractor","s":"TX","y":2018,"r":3008154,"e":587052,"m":2.04},{"n":238220,"d":"HVAC Contractor","s":"SC","y":2018,"r":486260,"e":92689,"m":2.27},{"n":238150,"d":"Window, Door, and Siding Contractor","s":"FL","y":2018,"r":2466219,"e":191014,"m":3.17},{"n":236118,"d":"Custom Closet Design and Installation","s":"TX","y":2018,"r":3357482,"e":885467,"m":3.24},{"n":238910,"d":"Construction and Repair of Hydro-Power Facilities","s":"VT","y":2018,"r":617763,"e":178312,"m":1.63},{"n":236118,"d":"Provider of Remodeling Services for Bathroom, Kitchen and Room Additions","s":"TX","y":2018,"r":205264,"e":48156,"m":0.93},{"n":238320,"d":"Commercial Painting Contractor","s":"WA","y":2018,"r":7142340,"e":2298000,"m":1.31},{"n":236118,"d":"Residential Remodeling Contractor","s":"NC","y":2018,"r":948000,"e":180000,"m":1.0},{"n":238220,"d":"Plumbing Contractor","s":"OK","y":2018,"r":347804,"e":44954,"m":5.12},{"n":238120,"d":"Steel Erection Company","s":"SD","y":2018,"r":11500000,"e":574645,"m":2.18},{"n":238220,"d":"Plumbing Contractor","s":"WA","y":2018,"r":638533,"e":234804,"m":1.19},{"n":561730,"d":"Residential Lawn Service and Landscaping","s":"FL","y":2018,"r":409899,"e":174185,"m":3.01},{"n":238220,"d":"HVAC Contractor","s":"MA","y":2018,"r":2490927,"e":299793,"m":3.0},{"n":238320,"d":"Painting Contractor","s":"FL","y":2018,"r":284397,"e":28941,"m":0.86},{"n":423840,"d":"Distributes Industrial Supplies and Building Materials","s":"FL","y":2018,"r":4967546,"e":551703,"m":4.53},{"n":561730,"d":"Landscaping Business","s":"UT","y":2018,"r":474720,"e":141012,"m":1.88},{"n":238220,"d":"HVAC Contractor","s":"IA","y":2018,"r":2887832,"e":479242,"m":3.54},{"n":238210,"d":"Electrical Contractor","s":"GA","y":2018,"r":1383864,"e":432873,"m":2.66},{"n":237110,"d":"Well Drilling Company","s":"MN","y":2018,"r":764306,"e":291231,"m":1.23},{"n":238110,"d":"Commercial and Residential Concrete Contractor","s":"FL","y":2018,"r":1230375,"e":195172,"m":2.56},{"n":561730,"d":"Landscaping Service","s":"ID","y":2018,"r":1010839,"e":345157,"m":2.39},{"n":238220,"d":"Commercial and Residential Heating, Ventilation, and Air Conditioning (HVAC) Con","s":"FL","y":2018,"r":1527000,"e":348000,"m":2.16},{"n":238290,"d":"Installer and Servicer of Residential and Commercial Garage Doors","s":"CO","y":2018,"r":360000,"e":125000,"m":1.56},{"n":238350,"d":"Kitchen and Bath Remodeling Contractors","s":"AZ","y":2018,"r":1388887,"e":289835,"m":1.12},{"n":444180,"d":"Building Materials Store","s":"FL","y":2018,"r":2365749,"e":229816,"m":3.59},{"n":561730,"d":"Residential and Commercial Lawn Care and Landscaping","s":"FL","y":2018,"r":834238,"e":224247,"m":2.07},{"n":236220,"d":"Telecommunications Outside Plant Infrastructure Construction Services","s":"MI","y":2018,"r":15540535,"e":2442053,"m":3.85},{"n":238160,"d":"Provider of Exterior Services Such as Roofing, Siding and Other installations","s":"CO","y":2018,"r":3298028,"e":543623,"m":1.65},{"n":238220,"d":"Fireplace Contractor","s":"NJ","y":2018,"r":320699,"e":11939,"m":10.47},{"n":238220,"d":"Heating, Ventilation, Air Conditioning (HVAC) Installation","s":"BC","y":2018,"r":2645644,"e":442035,"m":3.17},{"n":238210,"d":"Electrical Contractor","s":"CA","y":2018,"r":1337291,"e":224000,"m":1.73},{"n":459999,"d":"Specialty Construction Material Retailer","s":"ID","y":2018,"r":419688,"e":133933,"m":2.55},{"n":561790,"d":"Home Improvement Contractor","s":"WA","y":2018,"r":1447686,"e":244701,"m":1.23},{"n":237310,"d":"Project and Construction Management Services for Passenger Transportation Indust","s":"CA","y":2018,"r":7820085,"e":1755000,"m":2.39},{"n":238220,"d":"Heating and Ventilation Company","s":"AB","y":2018,"r":1089635,"e":334961,"m":2.36},{"n":561730,"d":"Residential Lawn Care, Tree Trimming, and Landscaping Services","s":"FL","y":2018,"r":447954,"e":114215,"m":2.01},{"n":238220,"d":"Industrial Furnace Contractors and Repair","s":"GA","y":2018,"r":19794143,"e":3800000,"m":1.62},{"n":449129,"d":"Custom Framing Shop and Art Supply Store","s":"CO","y":2018,"r":265630,"e":34907,"m":2.15},{"n":561730,"d":"Landscaping Business","s":"SC","y":2018,"r":73846,"e":41773,"m":1.2},{"n":561730,"d":"Residential and Commercial Lawn Service, Landscaping Design, and Tree Trimming","s":"FL","y":2018,"r":339165,"e":37189,"m":3.23},{"n":561720,"d":"Provider of Construction Home Cleaning","s":"FL","y":2018,"r":504203,"e":253108,"m":2.03},{"n":238160,"d":"Provider of Commercial Roofing Services","s":"GA","y":2018,"r":5201011,"e":941654,"m":2.02},{"n":238220,"d":"HVAC Company","s":"FL","y":2018,"r":652000,"e":86000,"m":2.18},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractors","s":"MA","y":2018,"r":978017,"e":121785,"m":2.05},{"n":238220,"d":"A/C and Heating Contractor","s":"FL","y":2018,"r":676024,"e":155814,"m":1.6},{"n":238220,"d":"HVAC Contractor","s":"MN","y":2018,"r":291702,"e":139968,"m":0.82},{"n":238990,"d":"Installs Screen Doors and Window Screens and Provides Repair","s":"FL","y":2018,"r":480953,"e":89882,"m":1.84},{"n":238160,"d":"Provider of Roofing, Siding and Gutter Repair and Installation","s":"CO","y":2018,"r":1100000,"e":240000,"m":0.52},{"n":238150,"d":"Glass and Glazing Contractors","s":"CT","y":2018,"r":1840335,"e":251805,"m":1.11},{"n":449129,"d":"Framing Shop","s":"NY","y":2018,"r":535000,"e":110000,"m":1.14},{"n":561730,"d":"Landscape Maintenance Company","s":"FL","y":2018,"r":872538,"e":218554,"m":5.47},{"n":238320,"d":"Commercial Painting Company","s":"CO","y":2018,"r":408000,"e":60817,"m":0.41},{"n":238210,"d":"Industrial Electrical Contractor","s":"PA","y":2018,"r":6241247,"e":361603,"m":3.6},{"n":237130,"d":"Provides Cellular Tower and Flatwork Concrete Construction Services","s":"CA","y":2018,"r":4742910,"e":526136,"m":2.38},{"n":238330,"d":"Flooring Installation","s":"CO","y":2018,"r":4672104,"e":938782,"m":1.92},{"n":561720,"d":"Construction Cleanup Services","s":"MA","y":2018,"r":2609927,"e":548795,"m":2.96},{"n":238210,"d":"Heating, Ventilation, Air-Conditioning (HVAC) Contractor","s":"FL","y":2018,"r":3907991,"e":376835,"m":2.92},{"n":238220,"d":"Provider of Plumbing Services","s":"CA","y":2018,"r":1060769,"e":266963,"m":2.62},{"n":238210,"d":"Commercial Plumbing and HVAC","s":"OH","y":2018,"r":10000000,"e":1910000,"m":1.71},{"n":238210,"d":"Heating, Ventilation, Air-Conditioning (HVAC) Contractor","s":"FL","y":2018,"r":1356363,"e":356546,"m":2.52},{"n":561730,"d":"Landscaping Services","s":"PA","y":2018,"r":2167392,"e":742840,"m":2.83},{"n":238210,"d":"Electrical Contractor Specializing in LED Lighting and Smart Home Automation","s":"FL","y":2018,"r":7080975,"e":1990499,"m":1.79},{"n":238320,"d":"Commercial Apartment Maintenance and Painting Company","s":"GA","y":2018,"r":952900,"e":292941,"m":1.96},{"n":238170,"d":"Gutter Contractors","s":"MN","y":2018,"r":666276,"e":229617,"m":1.42},{"n":238330,"d":"Residential and Commercial Flooring Contractors","s":"NC","y":2018,"r":1032118,"e":215135,"m":0.98},{"n":423310,"d":"Lumber Distributor","s":"TX","y":2018,"r":12634593,"e":554220,"m":8.3},{"n":238990,"d":"Parking Lot Maintenance and Repair","s":"FL","y":2018,"r":1022541,"e":153027,"m":3.92},{"n":238990,"d":"Brick Paving Contractor","s":"FL","y":2018,"r":1654264,"e":224612,"m":3.78},{"n":236118,"d":"Provider of Residential Restoration Services for Fire, Water and Storm Damage","s":"TX","y":2018,"r":1287750,"e":686394,"m":2.19},{"n":236118,"d":"Water and Fire Damage Remediation and Restoration","s":"TX","y":2018,"r":761189,"e":311836,"m":1.11},{"n":238990,"d":"Installer of Residential Fences","s":"TN","y":2018,"r":1580107,"e":81006,"m":7.22},{"n":238150,"d":"Commercial Glass and Glazing Company","s":"FL","y":2018,"r":2195939,"e":194096,"m":1.29},{"n":238160,"d":"Installation of Roofing","s":"MN","y":2018,"r":2149318,"e":505449,"m":1.9},{"n":238220,"d":"Residential and Commercial Plumbing Business","s":"FL","y":2018,"r":1412550,"e":464116,"m":2.08},{"n":238170,"d":"Instillation of Gutter Guard for Residential Homes","s":"CO","y":2018,"r":2017003,"e":768421,"m":2.7},{"n":237990,"d":"Marine Dock Construction Company","s":"FL","y":2018,"r":896539,"e":134494,"m":0.82},{"n":238220,"d":"HVAC Company","s":"FL","y":2018,"r":506190,"e":117216,"m":1.49},{"n":449129,"d":"Art and Framing Shop Serving Individual and Corporate Clients","s":"MI","y":2018,"r":465000,"e":145000,"m":1.1},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2018,"r":2581339,"e":323276,"m":3.2},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2018,"r":2597804,"e":358536,"m":2.93},{"n":238910,"d":"Site Preparation Contractor providing Excavation, Demolition, and Sewage System ","s":"ON","y":2018,"r":1186661,"e":497291,"m":4.02},{"n":238990,"d":"Provider of Maintenance and Repair of Asphalt and Concrete Surfaces","s":"CO","y":2018,"r":5549079,"e":1496448,"m":3.21},{"n":238220,"d":"Plumbing, Heating and Air Conditioning Contractor (60% Residential and 40% Comme","s":"NY","y":2018,"r":1364468,"e":145081,"m":1.9},{"n":238110,"d":"Concrete Contracting and Demolition Company","s":"FL","y":2018,"r":1791881,"e":750164,"m":1.73},{"n":238390,"d":"Countertop Fabricator and Installer","s":"FL","y":2018,"r":1399533,"e":205746,"m":4.01},{"n":541320,"d":"Architectural Landscaping Business","s":"BC","y":2018,"r":889582,"e":266454,"m":1.05},{"n":238220,"d":"Plumbing Company","s":"FL","y":2018,"r":823703,"e":153395,"m":1.68},{"n":238210,"d":"Electrical Contractor","s":"IN","y":2018,"r":3390636,"e":232879,"m":0.21},{"n":561730,"d":"Landscaping Maintenance","s":"TX","y":2018,"r":1116913,"e":147000,"m":2.72},{"n":561730,"d":"Lawn Landscaping Services","s":"MT","y":2018,"r":1064857,"e":395515,"m":1.39},{"n":561730,"d":"Commercial Landscaping Maintenance Business","s":"FL","y":2018,"r":1623655,"e":302772,"m":2.25},{"n":561730,"d":"Lawn Landscaping Services","s":"MA","y":2018,"r":1123535,"e":364682,"m":2.06},{"n":238220,"d":"HVAC Company","s":"FL","y":2018,"r":317291,"e":86848,"m":1.73},{"n":236115,"d":"General Construction Company","s":"FL","y":2018,"r":627297,"e":124622,"m":2.0},{"n":238990,"d":"Fencing Contractor","s":"FL","y":2018,"r":1467348,"e":385119,"m":1.49},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Contractor","s":"CA","y":2018,"r":436588,"e":100409,"m":1.24},{"n":333413,"d":"Manufacturer and Seller of Custom Home Air Purifiers and Supplies","s":"IL","y":2018,"r":681020,"e":124482,"m":2.65},{"n":238990,"d":"Signage Erection Services","s":"LA","y":2018,"r":2045367,"e":618269,"m":2.65},{"n":236115,"d":"Construction Contractors","s":"NS","y":2018,"r":12387714,"e":1628664,"m":5.22},{"n":238110,"d":"Concrete Contractors","s":"MT","y":2018,"r":1420864,"e":285251,"m":1.47},{"n":238220,"d":"Installation and Repair of Heating, Ventilation, and Air-Conditioning (HVAC) Equ","s":"CA","y":2018,"r":2390215,"e":390898,"m":2.42},{"n":238220,"d":"HVAC Company","s":"FL","y":2018,"r":1004192,"e":195488,"m":3.07},{"n":238160,"d":"Roofing Contractor","s":"AB","y":2018,"r":5588998,"e":553743,"m":1.13},{"n":238990,"d":"Specialty Trade Contractor","s":"TX","y":2018,"r":1009000,"e":332000,"m":1.81},{"n":238990,"d":"Gate Installation company (home-based business)","s":"FL","y":2018,"r":177924,"e":61369,"m":0.85},{"n":238910,"d":"Construction Site Services","s":"BC","y":2018,"r":1599000,"e":551000,"m":2.74},{"n":238220,"d":"HVAC Company","s":"FL","y":2018,"r":266463,"e":66006,"m":1.29},{"n":561730,"d":"Lawn Landscaping Services","s":"MT","y":2018,"r":2124068,"e":786574,"m":2.86},{"n":238990,"d":"Fencing Contractor","s":"FL","y":2018,"r":722716,"e":60688,"m":3.79},{"n":423730,"d":"HVAC Equipment and Components Sales","s":"CO","y":2018,"r":8413925,"e":733295,"m":2.45},{"n":541320,"d":"Provides Landscaping, Lawn Care, Retaining Walls, and Walkways","s":"FL","y":2018,"r":7071017,"e":1830908,"m":1.99},{"n":238220,"d":"Commercial Fire and Sprinkler Installation and Service","s":"WI","y":2018,"r":5166649,"e":866256,"m":1.58},{"n":238210,"d":"Electrical Contractor","s":"ON","y":2018,"r":1280194,"e":147744,"m":4.6},{"n":238220,"d":"HVAC Company","s":"FL","y":2018,"r":1314565,"e":194886,"m":1.74},{"n":238390,"d":"Bathroom Remodeling Services Franchise","s":"MN","y":2018,"r":349257,"e":106002,"m":2.63},{"n":561730,"d":"Residential and Commercial Lawn Care, Landscaping, and Irrigation Services","s":"FL","y":2018,"r":482305,"e":112945,"m":0.97},{"n":561730,"d":"Landscaping Services","s":"FL","y":2018,"r":489888,"e":125223,"m":0.88},{"n":238220,"d":"Heating and Air Conditioning Company","s":"FL","y":2018,"r":581036,"e":158539,"m":2.05},{"n":238210,"d":"Heating, Ventilation, Air-Conditioning (HVAC) Contractor","s":"NS","y":2018,"r":4346501,"e":454690,"m":1.43},{"n":238220,"d":"Commercial (70%) and Residential (30%) Heating Ventilation and Commerical (100%)","s":"WA","y":2018,"r":3319872,"e":656897,"m":3.05},{"n":561730,"d":"Landscaping Services","s":"MA","y":2018,"r":1151134,"e":397146,"m":1.7},{"n":238330,"d":"Flooring Sales and Installation Company","s":"CO","y":2018,"r":820916,"e":233782,"m":2.83},{"n":238330,"d":"Flooring Sales and Installation","s":"CA","y":2018,"r":1438354,"e":202211,"m":1.88},{"n":561730,"d":"Lawn Landscaping Services","s":"VA","y":2018,"r":416827,"e":124328,"m":1.05},{"n":238150,"d":"Glass Installation Contractor","s":"CO","y":2018,"r":1855457,"e":445747,"m":2.58},{"n":238220,"d":"HVAC Company","s":"FL","y":2018,"r":875000,"e":136000,"m":1.1},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2018,"r":1575356,"e":172197,"m":1.6},{"n":236118,"d":"Water Damage Restoration","s":"MT","y":2018,"r":1137730,"e":272956,"m":2.34},{"n":238220,"d":"Plumbing Repair and Service","s":"ID","y":2018,"r":785000,"e":195600,"m":2.04},{"n":561730,"d":"Provides Landscape, Lawn Maintenance and Related Services","s":"FL","y":2017,"r":4967017,"e":971450,"m":2.57},{"n":238220,"d":"Commercial HVAC Contractors","s":"CA","y":2017,"r":4065684,"e":877756,"m":3.9},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2017,"r":225187,"e":56445,"m":2.13},{"n":238990,"d":"Special Trade Contractors","s":"KS","y":2017,"r":1033538,"e":411088,"m":2.43},{"n":561730,"d":"Provides Landscape Maintenance, Landscape Installation and Tree Trimming","s":"FL","y":2017,"r":757624,"e":253474,"m":2.96},{"n":236118,"d":"Mold, Water and Fire Remediation Service","s":"MI","y":2017,"r":831986,"e":230218,"m":2.06},{"n":238150,"d":"Glass Glazing Contractor","s":"CA","y":2017,"r":440994,"e":161231,"m":1.52},{"n":238220,"d":"Residential Heating, Ventilation, and Air-Conditioning (HVAC) Contractors","s":"NY","y":2017,"r":1836637,"e":325075,"m":2.2},{"n":238210,"d":"Heating, Ventilation, Air-Conditioning (HVAC) Contractor","s":"FL","y":2017,"r":6824162,"e":975888,"m":1.74},{"n":238350,"d":"Window and Door, Hurricane Protection/Shutters, and Window Treatment Contractor","s":"FL","y":2017,"r":654248,"e":100025,"m":1.65},{"n":238390,"d":"In-Field Provider of Protective Coating Applications to the Construction and Uti","s":"FL","y":2017,"r":2951663,"e":764827,"m":4.18},{"n":238220,"d":"Air Conditioning Business","s":"FL","y":2017,"r":1454430,"e":200452,"m":3.12},{"n":333991,"d":"Tool Manufacturing with a Focus on Exterior Construction for Both Commercial and","s":"WA","y":2017,"r":3804865,"e":1371426,"m":4.92},{"n":238220,"d":"Commercial Heating, Ventilation, Air-Conditioning (HVAC) Contractors","s":"ON","y":2017,"r":2096739,"e":412449,"m":3.88},{"n":238220,"d":"Commercial Heating and A/C Company","s":"FL","y":2017,"r":3422167,"e":270784,"m":3.69},{"n":238350,"d":"Door and Window Frame Construction","s":"FL","y":2017,"r":1503998,"e":163578,"m":2.75},{"n":236220,"d":"Commercial Building Repairs and Maintenance","s":"QC","y":2017,"r":951277,"e":130362,"m":2.95},{"n":561730,"d":"Landscaping Services","s":"FL","y":2017,"r":195449,"e":38881,"m":1.74},{"n":238990,"d":"Commercial Brick Paving Business","s":"FL","y":2017,"r":2449328,"e":375664,"m":2.26},{"n":238350,"d":"Provider of Aluminum Material Installation for Screens, Shelters, Railings and O","s":"FL","y":2017,"r":3081743,"e":378107,"m":3.39},{"n":238350,"d":"Wholesale Trade Sales and Installation of Millwork, Doors, Sashes, and Windows","s":"TX","y":2017,"r":38191413,"e":2025900,"m":7.4},{"n":561730,"d":"Landscaping Services","s":"FL","y":2017,"r":532222,"e":223918,"m":2.68},{"n":238220,"d":"Plumber Contractor","s":"FL","y":2017,"r":269824,"e":122164,"m":1.42},{"n":238220,"d":"Residential Heating and Airconditioning Contractor","s":"WI","y":2017,"r":597587,"e":77682,"m":3.15},{"n":238190,"d":"Provides Residential and Commercial Building Exterior Renovation and Restoration","s":"AB","y":2017,"r":1384886,"e":307343,"m":1.46},{"n":238210,"d":"Electrical Contractor","s":"VA","y":2017,"r":673734,"e":175000,"m":1.29},{"n":238220,"d":"Residential HVAC Company","s":"FL","y":2017,"r":2025695,"e":455206,"m":1.98},{"n":561730,"d":"Landscaping Services","s":"CO","y":2017,"r":31425247,"e":9949590,"m":2.38},{"n":238990,"d":"Commercial Paving Company","s":"CA","y":2017,"r":4245760,"e":370558,"m":2.06},{"n":561730,"d":"Landscaping Services","s":"FL","y":2017,"r":2947799,"e":288383,"m":3.12},{"n":321992,"d":"Log and Fence Manufacturing and Construction / Outdoor Power Equipment Sales and","s":"ID","y":2017,"r":1342232,"e":266469,"m":2.4},{"n":332322,"d":"Sheet Metal Machine Shop","s":"MA","y":2017,"r":1633948,"e":100192,"m":2.5},{"n":238220,"d":"Air Conditioning Contractor","s":"FL","y":2017,"r":1496370,"e":228367,"m":1.97},{"n":722310,"d":"Food Service Contractor","s":"","y":2017,"r":12158000,"e":570000,"m":5.49},{"n":238210,"d":"Electrical Contractor Specializing in Highway Infrastructure","s":"TX","y":2017,"r":24724788,"e":2138863,"m":7.39},{"n":238990,"d":"Fence Contractors","s":"FL","y":2017,"r":3024000,"e":432000,"m":1.93},{"n":238220,"d":"Residential (80%) and Commercial (20%) Plumbing and Heating, Ventilation, and Ai","s":"NC","y":2017,"r":7322426,"e":1966630,"m":4.07},{"n":423320,"d":"Wholesaler of Concrete Ready-Mix and Other Landscaping Materials","s":"CA","y":2017,"r":9070917,"e":1287699,"m":4.61},{"n":561730,"d":"Landscaping Services","s":"FL","y":2017,"r":593895,"e":133198,"m":2.45},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"MN","y":2017,"r":701729,"e":96701,"m":0.9},{"n":561730,"d":"Landscaping Services","s":"FL","y":2017,"r":554781,"e":215957,"m":2.24},{"n":561730,"d":"Landscaping Services","s":"FL","y":2017,"r":312177,"e":65282,"m":2.07},{"n":561730,"d":"Landscaping Services","s":"FL","y":2017,"r":115776,"e":53983,"m":1.39},{"n":238990,"d":"Fence Construction Company","s":"PA","y":2017,"r":481071,"e":105192,"m":0.81},{"n":332322,"d":"Heating, Ventilation, and Air Conditioning (HVAC) Pipe Ducts Manufacturer","s":"FL","y":2017,"r":511873,"e":74274,"m":2.96},{"n":237110,"d":"Paving, Underground Utility Construction and Repair, and Site Development and Ex","s":"PA","y":2017,"r":2000000,"e":189000,"m":3.97},{"n":238990,"d":"Moving Company","s":"FL","y":2017,"r":467600,"e":172934,"m":2.17},{"n":561730,"d":"Landscaping Company","s":"AB","y":2017,"r":3978000,"e":1376039,"m":1.45},{"n":238220,"d":"Residential and Commercial HVAC Company","s":"FL","y":2017,"r":629379,"e":124051,"m":0.63},{"n":238210,"d":"Heating, Ventilation, and Air Conditioning (HVAC) and Plumbing Contractors","s":"CO","y":2017,"r":658631,"e":144391,"m":1.45},{"n":238220,"d":"Residential and Commercial HVAC and Plumbing Company","s":"FL","y":2017,"r":1903325,"e":459839,"m":5.22},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2017,"r":341132,"e":15546,"m":4.18},{"n":221310,"d":"Landscaping Irrigation Installation and Repair","s":"BC","y":2017,"r":758077,"e":208191,"m":1.91},{"n":561730,"d":"Landscaping Services","s":"FL","y":2017,"r":125296,"e":76919,"m":1.24},{"n":561730,"d":"Landscaping Services","s":"CA","y":2017,"r":408686,"e":108957,"m":1.28},{"n":238220,"d":"Residential HVAC Company","s":"FL","y":2017,"r":1619971,"e":263676,"m":2.56},{"n":238210,"d":"Electrical Contracting","s":"MD","y":2017,"r":4743931,"e":957501,"m":1.14},{"n":238220,"d":"Plumber Contractor","s":"FL","y":2017,"r":1903948,"e":226216,"m":1.7},{"n":236118,"d":"Home Improvement Contractor","s":"FL","y":2017,"r":2531869,"e":649977,"m":3.08},{"n":238220,"d":"Heating, Ventilation, Air-Conditioning (HVAC) Company","s":"AB","y":2017,"r":1256518,"e":228686,"m":0.87},{"n":238210,"d":"Traffic Signal Installation","s":"VA","y":2017,"r":3975481,"e":503216,"m":5.89},{"n":238990,"d":"Concrete Floor Polishing","s":"ON","y":2017,"r":521000,"e":200000,"m":1.25},{"n":238220,"d":"HVAC and Electrical Contractor","s":"GA","y":2017,"r":1134973,"e":291305,"m":2.39},{"n":238290,"d":"Installer and Servicer of Garage Doors and Openers","s":"OH","y":2017,"r":278026,"e":149746,"m":1.6},{"n":561720,"d":"Commercial Building Janitorial Services","s":"TX","y":2017,"r":106617500,"e":9037665,"m":4.26},{"n":532412,"d":"Construction Machinery and Equipment Rentals","s":"WA","y":2017,"r":1345278,"e":469988,"m":5.78},{"n":238220,"d":"Heating, Ventilation, Air-Conditioning (HVAC) Contractor","s":"FL","y":2017,"r":695756,"e":155169,"m":2.42},{"n":238220,"d":"Provides Plumbing, Gas Line Installation, and Fireplace Retrofitting (home-based","s":"AB","y":2017,"r":302684,"e":67709,"m":1.77},{"n":236220,"d":"Commercial Contractor","s":"FL","y":2017,"r":5144525,"e":846924,"m":3.54},{"n":334519,"d":"Manufacturer of Automated Pipeline Inspection Systems","s":"CA","y":2017,"r":13145000,"e":1947000,"m":7.21},{"n":238150,"d":"Window Repair and Installation","s":"AB","y":2017,"r":1343257,"e":154654,"m":1.42},{"n":238110,"d":"Stone Contractor","s":"NC","y":2017,"r":6808979,"e":784562,"m":3.19},{"n":238120,"d":"Structural Steel and Precast Concrete Contractor","s":"FL","y":2017,"r":23732070,"e":2922058,"m":4.11},{"n":238220,"d":"HVAC Contractors","s":"MO","y":2017,"r":1031192,"e":221386,"m":1.42},{"n":561720,"d":"Commercial Construction Cleanup Business","s":"ID","y":2017,"r":769414,"e":260989,"m":3.45},{"n":238320,"d":"Painting Contractor","s":"VA","y":2017,"r":834934,"e":59297,"m":7.17},{"n":238220,"d":"Plumbing Contractor","s":"OH","y":2017,"r":1802099,"e":595964,"m":2.39},{"n":238220,"d":"HVAC Company","s":"FL","y":2017,"r":1665703,"e":239256,"m":3.03},{"n":238220,"d":"Heating, Ventilation, and Air Conditioning Sales and Installation","s":"MD","y":2017,"r":1265212,"e":135677,"m":4.76},{"n":238220,"d":"HVAC Company","s":"FL","y":2017,"r":2678438,"e":344353,"m":2.47},{"n":238220,"d":"Plumbing Business","s":"FL","y":2017,"r":1163955,"e":205387,"m":1.7},{"n":238220,"d":"HVAC Contractors","s":"TX","y":2017,"r":652169,"e":128268,"m":3.24},{"n":459920,"d":"Framing Services and Art Gallery","s":"FL","y":2017,"r":180076,"e":39999,"m":2.38},{"n":238350,"d":"Trim, Molding, and Baseboard Contractor","s":"FL","y":2017,"r":289800,"e":180422,"m":1.52},{"n":238220,"d":"Commercial Heating, Ventalation, and Air-Conditioning (HVAC) Contractor","s":"TX","y":2017,"r":2154165,"e":329848,"m":2.96},{"n":236118,"d":"Restoration and Renovation Services","s":"GA","y":2017,"r":3355090,"e":264488,"m":3.5},{"n":238990,"d":"Paving Contractor","s":"FL","y":2017,"r":7915239,"e":547919,"m":2.19},{"n":238220,"d":"Air Conditioning Contractor","s":"FL","y":2017,"r":1056622,"e":246332,"m":1.83},{"n":238990,"d":"Fencing Contractor","s":"FL","y":2017,"r":1868186,"e":181208,"m":2.76},{"n":561730,"d":"Landscaping Services","s":"TX","y":2017,"r":423270,"e":101930,"m":3.04},{"n":236115,"d":"Log Home Construction Company","s":"OH","y":2017,"r":79963,"e":21245,"m":6.12},{"n":484110,"d":"United States Mail Contractor Services","s":"CA","y":2017,"r":1684099,"e":415899,"m":1.2},{"n":238220,"d":"Full Service Plumbing Contractor","s":"UT","y":2017,"r":2801554,"e":274483,"m":2.97},{"n":238220,"d":"Residential HVAC Company","s":"FL","y":2017,"r":1612194,"e":394061,"m":2.42},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2017,"r":7187609,"e":794296,"m":2.64},{"n":444180,"d":"Lumber Company and Hardware Store","s":"NJ","y":2017,"r":12059163,"e":853356,"m":0.18},{"n":237310,"d":"Asphalt Paving Contractor","s":"MT","y":2017,"r":943599,"e":242972,"m":2.93},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2017,"r":1234151,"e":151098,"m":3.28},{"n":561730,"d":"Commercial Landscape Business","s":"TX","y":2017,"r":1745863,"e":375000,"m":4.67},{"n":238220,"d":"Commercial Heating, Ventilation, Air-Conditioning (HVAC) Service Company","s":"TX","y":2017,"r":871000,"e":329000,"m":2.13},{"n":238220,"d":"Heating and Air Conditioning Contractor","s":"CO","y":2017,"r":3280070,"e":698397,"m":2.43},{"n":444110,"d":"Online Specialty Outdoor Home Improvement Products Business","s":"ON","y":2017,"r":727446,"e":205069,"m":1.63},{"n":236115,"d":"Custom Closet and Shelving Manufacturing","s":"MT","y":2017,"r":371532,"e":82888,"m":0.9},{"n":238310,"d":"Insulation Contractor","s":"FL","y":2017,"r":1018998,"e":120229,"m":2.29},{"n":236220,"d":"Commercial General Contractor","s":"NC","y":2017,"r":8500000,"e":1160000,"m":1.55},{"n":237110,"d":"Water Well Services","s":"TX","y":2017,"r":1254395,"e":187179,"m":3.92},{"n":561730,"d":"Landscaping Services","s":"NY","y":2017,"r":1432988,"e":370665,"m":2.57},{"n":238220,"d":"Plumbing Contractor","s":"CA","y":2017,"r":831328,"e":215944,"m":0.6},{"n":513210,"d":"Computer Software for the Construction Industry","s":"FL","y":2017,"r":770871,"e":217053,"m":8.2},{"n":423740,"d":"Mechanical, HVAC, and Refrigeration Equipment Wholesaler","s":"CA","y":2017,"r":35282866,"e":3519644,"m":4.83},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2017,"r":676824,"e":191846,"m":1.12},{"n":238210,"d":"Lighting Retrofit Business","s":"TX","y":2017,"r":13818333,"e":2863033,"m":3.56},{"n":238220,"d":"Commercial HVAC Sales and Services","s":"TX","y":2017,"r":888300,"e":179400,"m":1.89},{"n":238220,"d":"Commercial HVAC and Plumbing Company","s":"FL","y":2017,"r":10283837,"e":1596092,"m":6.92},{"n":238210,"d":"Electrical Contractors","s":"ON","y":2017,"r":564770,"e":140078,"m":1.93},{"n":238220,"d":"Plumbing Business","s":"FL","y":2017,"r":462463,"e":98322,"m":1.53},{"n":238220,"d":"Commercial Heating, Ventilation, Air Conditioning (HVAC) Contractors","s":"NJ","y":2017,"r":927645,"e":165995,"m":2.71},{"n":444240,"d":"Retail and Wholesale Outlet for Sod and Landscape Materials","s":"FL","y":2017,"r":1735241,"e":171248,"m":3.01},{"n":236115,"d":"Residential General Contractor","s":"IA","y":2017,"r":611225,"e":76406,"m":0.65},{"n":423720,"d":"Distribution of Plumbing Supplies","s":"FL","y":2017,"r":2415018,"e":373033,"m":3.35},{"n":238910,"d":"Design and Installation of Septic Systems","s":"BC","y":2017,"r":950000,"e":250746,"m":0.8},{"n":238210,"d":"Electrical Contractors","s":"MA","y":2017,"r":53592000,"e":5867000,"m":2.05},{"n":236118,"d":"Home Enclosure Installation","s":"FL","y":2017,"r":723000,"e":166000,"m":1.96},{"n":238150,"d":"Glass Manufacturing","s":"MA","y":2017,"r":3661346,"e":394001,"m":2.44},{"n":423310,"d":"Lumber and Building Materials Distributor","s":"PA","y":2017,"r":9555000,"e":540000,"m":5.15},{"n":238910,"d":"Grading Contractor for Site Preperation","s":"FL","y":2016,"r":3704123,"e":896518,"m":3.0},{"n":238220,"d":"Heating, Ventilation, Air Conditioning (HVAC) Repair and Installation","s":"AR","y":2016,"r":1480347,"e":226230,"m":2.66},{"n":236220,"d":"Commercial Building Maintenance and Repair Services","s":"CA","y":2016,"r":2758010,"e":569606,"m":4.04},{"n":238210,"d":"Traffic Signal Construction and Maintenance","s":"PA","y":2016,"r":3477488,"e":485136,"m":2.58},{"n":423840,"d":"Distributor of Fasteners and Specialty Tools for the Construction Industry","s":"FL","y":2016,"r":3990644,"e":474929,"m":3.37},{"n":332322,"d":"Sheet Metal Fabrication","s":"WA","y":2016,"r":6196404,"e":350634,"m":12.26},{"n":238110,"d":"Concrete Resurfacing Contractors","s":"KY","y":2016,"r":1834375,"e":316029,"m":4.43},{"n":237310,"d":"Winter Road Construction and Maintenance","s":"AB","y":2016,"r":217000,"e":51000,"m":12.06},{"n":238210,"d":"Electrical Contractor","s":"","y":2016,"r":1600000,"e":290200,"m":1.72},{"n":449129,"d":"Retail Framing Shop","s":"OH","y":2016,"r":275000,"e":53149,"m":2.45},{"n":238320,"d":"Commercial and Residential Painting Contractor","s":"CO","y":2016,"r":2291098,"e":308826,"m":4.08},{"n":238220,"d":"Plumbing Contractor","s":"AZ","y":2016,"r":692436,"e":20112,"m":12.43},{"n":541512,"d":"Information Technology Services Contractor for the U.S. Department of Defense","s":"CA","y":2016,"r":2830645,"e":463346,"m":4.47},{"n":238390,"d":"Protective Coatings Contractor","s":"WA","y":2016,"r":724717,"e":248349,"m":1.32},{"n":238210,"d":"Commercial Installation of Low Voltage Communication Systems","s":"TX","y":2016,"r":554190,"e":123109,"m":1.67},{"n":238220,"d":"Residential Full Service Heating, Ventilation, Air Conditioning and Refrigeratio","s":"NY","y":2016,"r":2995917,"e":280339,"m":2.68},{"n":238990,"d":"Fencing Contractor","s":"AB","y":2016,"r":1180728,"e":220013,"m":0.23},{"n":444230,"d":"Landscape Supply Retailer","s":"BC","y":2016,"r":2406000,"e":497000,"m":3.82},{"n":444180,"d":"Building Materials Wholesaler","s":"IL","y":2016,"r":29178000,"e":727000,"m":10.01},{"n":238220,"d":"Residential and Commercial Heating, Ventalation, Air Conditioning (HVAC) Busines","s":"NY","y":2016,"r":5075800,"e":2067500,"m":2.06},{"n":238220,"d":"HVAC Company","s":"FL","y":2016,"r":829479,"e":103418,"m":0.82},{"n":238990,"d":"Fencing Contractor","s":"NJ","y":2016,"r":2114833,"e":658156,"m":2.13},{"n":449129,"d":"Framing Services","s":"FL","y":2016,"r":140699,"e":27443,"m":2.73},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2016,"r":924473,"e":145204,"m":2.31},{"n":238330,"d":"Wood Floor Contractors","s":"FL","y":2016,"r":701000,"e":121000,"m":1.65},{"n":238220,"d":"Plumbing Company","s":"FL","y":2016,"r":1535989,"e":398178,"m":2.51},{"n":561730,"d":"Landscaping Services","s":"OR","y":2016,"r":1378413,"e":355671,"m":1.95},{"n":238220,"d":"HVAC Service and Installation","s":"UT","y":2016,"r":1966141,"e":612150,"m":3.27},{"n":337121,"d":"Custom Home Furniture Manufacturer","s":"NC","y":2016,"r":1145755,"e":239441,"m":2.37},{"n":238320,"d":"Commercial Painting Contractors","s":"MI","y":2016,"r":1032532,"e":237054,"m":2.0},{"n":238220,"d":"HVAC Company","s":"FL","y":2016,"r":2606371,"e":403403,"m":3.47},{"n":423390,"d":"Distributor of Commercial Building Materials","s":"","y":2016,"r":64877000,"e":7884043,"m":3.17},{"n":238350,"d":"Garage Doors Installation and Repair","s":"CT","y":2016,"r":633126,"e":69471,"m":2.66},{"n":238220,"d":"Air Conditioning and Heater Service","s":"FL","y":2016,"r":670485,"e":105799,"m":2.88},{"n":236220,"d":"Wheelchair Ramps Installation Services","s":"VT","y":2016,"r":320608,"e":129507,"m":1.54},{"n":541320,"d":"Landscaping and Lawn Care Services","s":"FL","y":2016,"r":303642,"e":59088,"m":1.18},{"n":236210,"d":"Steel Erection Construction","s":"NC","y":2016,"r":4116506,"e":706781,"m":2.74},{"n":238340,"d":"Supplier and Installer of Marble and Granite Countertops","s":"FL","y":2016,"r":915621,"e":294779,"m":2.54},{"n":459920,"d":"Art Gallery and Framing Services","s":"TX","y":2016,"r":745000,"e":264000,"m":1.99},{"n":238220,"d":"HVAC Company","s":"FL","y":2016,"r":614114,"e":70415,"m":1.42},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2016,"r":1011930,"e":196766,"m":0.91},{"n":236118,"d":"Handyman Service","s":"OH","y":2016,"r":351107,"e":52964,"m":2.64},{"n":561790,"d":"Chimney Construction and Restoration Company","s":"VA","y":2016,"r":1003990,"e":274323,"m":3.99},{"n":238150,"d":"Commercial Glass and Glazing Contractor","s":"FL","y":2016,"r":3182827,"e":720314,"m":2.88},{"n":238330,"d":"Commercial and Residential Flooring Installation Business with a Small Retail Co","s":"ON","y":2016,"r":1424825,"e":162214,"m":3.08},{"n":236118,"d":"Residential Maintenance Company","s":"SC","y":2016,"r":606776,"e":153920,"m":2.12},{"n":238210,"d":"Solar Panel Installation","s":"OH","y":2016,"r":1401474,"e":566786,"m":2.13},{"n":238220,"d":"Sprinkler System Installer","s":"PA","y":2016,"r":4958293,"e":536487,"m":1.58},{"n":238220,"d":"HVAC Contractor","s":"MO","y":2016,"r":1586257,"e":490235,"m":1.17},{"n":561720,"d":"Commercial and Construction Cleaning","s":"AZ","y":2016,"r":1388913,"e":218997,"m":3.17},{"n":236118,"d":"Handyman Service","s":"MN","y":2016,"r":554560,"e":139387,"m":2.01},{"n":238190,"d":"Outdoor Structures Construction for Homes","s":"TX","y":2016,"r":2470951,"e":138870,"m":5.47},{"n":238140,"d":"Chimney Sales and Service","s":"PA","y":2016,"r":459861,"e":257789,"m":1.53},{"n":238990,"d":"Concrete Coating Contractor and Paver Installation","s":"FL","y":2016,"r":308952,"e":126166,"m":1.19},{"n":561720,"d":"Janitorial Service for Contractors and Residential (home-based business)","s":"OR","y":2016,"r":539014,"e":112556,"m":1.68},{"n":444180,"d":"Plumbing Supply Distributor","s":"FL","y":2016,"r":3432187,"e":223434,"m":3.72},{"n":423390,"d":"Supplier of Specialty Building Materials","s":"","y":2016,"r":12262000,"e":501000,"m":7.7},{"n":561730,"d":"Commercial Landscaping Services","s":"GA","y":2016,"r":7863210,"e":726924,"m":3.44},{"n":238220,"d":"Fire Sprinkler Systems Contractor","s":"GA","y":2016,"r":2525000,"e":420344,"m":2.85},{"n":238210,"d":"Seasonal Holiday Lighting Services","s":"WA","y":2016,"r":552716,"e":264595,"m":2.44},{"n":238220,"d":"Air Conditioning Service and Installation Company","s":"FL","y":2016,"r":729705,"e":156385,"m":1.89},{"n":238220,"d":"Refrigeration Contractor","s":"SD","y":2016,"r":749499,"e":170453,"m":2.64},{"n":238350,"d":"Cabinet Resurfacing/Refinishing Company","s":"FL","y":2016,"r":667422,"e":142147,"m":2.46},{"n":236118,"d":"Residential Kitchen and Bath Remodeling","s":"SC","y":2016,"r":917523,"e":60967,"m":4.54},{"n":238220,"d":"Air Conditioning Sales, Service, and Repair","s":"FL","y":2016,"r":435082,"e":62614,"m":3.82},{"n":238990,"d":"Fencing Contractor","s":"ID","y":2016,"r":1416633,"e":377979,"m":2.08},{"n":238220,"d":"Commercial and Industrial Boiler Service Business","s":"NH","y":2016,"r":546500,"e":178400,"m":0.98},{"n":561790,"d":"Commercial and Residential Restoration and Remodeling Services","s":"MN","y":2016,"r":506339,"e":129523,"m":0.23},{"n":238160,"d":"Roofing Contractor","s":"CA","y":2016,"r":2348709,"e":214800,"m":1.4},{"n":561730,"d":"Commercial Landscaping and Lawn Maintenance Business","s":"FL","y":2016,"r":1203177,"e":286093,"m":3.84},{"n":238150,"d":"Impact Window and Door Company","s":"FL","y":2016,"r":7524841,"e":874154,"m":3.15},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2016,"r":952384,"e":171296,"m":1.75},{"n":238330,"d":"Flooring Contractor","s":"TX","y":2016,"r":3137437,"e":454392,"m":2.32},{"n":561730,"d":"Commercial and Residential Landscape Maintenance","s":"CA","y":2016,"r":7299212,"e":1438745,"m":1.99},{"n":238220,"d":"Air Conditioning and Heating Business","s":"FL","y":2016,"r":2405022,"e":703827,"m":2.55},{"n":238220,"d":"Air Conditioning and Heating Business","s":"FL","y":2016,"r":878461,"e":136608,"m":2.49},{"n":561730,"d":"Landscaping Services","s":"FL","y":2016,"r":1153679,"e":320745,"m":2.26},{"n":238220,"d":"HVAC Contractor","s":"NJ","y":2016,"r":1493464,"e":157582,"m":7.62},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2016,"r":6469540,"e":612815,"m":2.16},{"n":236118,"d":"Disaster Remediation and Restoration Services Franchise","s":"MS","y":2016,"r":1409644,"e":868782,"m":1.01},{"n":444180,"d":"Sells Kitchen Cabinets to Contractors","s":"FL","y":2016,"r":1552940,"e":193476,"m":2.71},{"n":238390,"d":"Commercial Window Covering Installation Service","s":"NC","y":2016,"r":303990,"e":85039,"m":1.47},{"n":561730,"d":"Landscaping and Lawn Maintenance","s":"FL","y":2016,"r":691639,"e":131061,"m":3.05},{"n":561730,"d":"Landscaping and Lawn Maintenance Company","s":"FL","y":2016,"r":756415,"e":400910,"m":1.0},{"n":236118,"d":"Water, Fire, and Mold Damage Restoration Company","s":"","y":2016,"r":1063062,"e":134341,"m":2.42},{"n":236118,"d":"Residential Remodeling Business","s":"CO","y":2016,"r":1164655,"e":340413,"m":1.0},{"n":423730,"d":"Air Heating and Cooling Wholesaler","s":"VA","y":2016,"r":2793248,"e":143236,"m":5.55},{"n":238350,"d":"Laminate Countertop Installation","s":"AZ","y":2016,"r":665320,"e":122497,"m":3.35},{"n":561730,"d":"Landscaping Services","s":"WA","y":2016,"r":310826,"e":36482,"m":2.6},{"n":238210,"d":"Installs, Programs, Services and Retrofits Large HVAC Systems with Variable Freq","s":"FL","y":2016,"r":866402,"e":137568,"m":1.45},{"n":238990,"d":"Asphalt Paving and Maintenance Contractor","s":"FL","y":2016,"r":3768684,"e":331648,"m":5.17},{"n":238220,"d":"Residential Air Conditioning and Heating Business","s":"FL","y":2016,"r":5018727,"e":1006741,"m":1.49},{"n":561730,"d":"Residential Lawn Care and Landscaping Business","s":"FL","y":2016,"r":157796,"e":47366,"m":1.03},{"n":238350,"d":"Flooring Contractor","s":"MO","y":2016,"r":2163826,"e":247820,"m":2.56},{"n":238220,"d":"Air Conditioning and Heating Business","s":"FL","y":2016,"r":906949,"e":266108,"m":0.56},{"n":238350,"d":"Kitchen Cabinet Design and Installation","s":"FL","y":2016,"r":1055450,"e":91213,"m":1.92},{"n":238990,"d":"Asphalt Paving Contractor","s":"OH","y":2016,"r":2475213,"e":635428,"m":2.52},{"n":561730,"d":"Landscaping Business","s":"FL","y":2016,"r":261933,"e":63591,"m":1.37},{"n":238220,"d":"Residential Air Conditioning and Heating Business","s":"FL","y":2016,"r":7912719,"e":2503743,"m":2.2},{"n":561730,"d":"Commercial Landscape Business","s":"GA","y":2016,"r":1898000,"e":274000,"m":3.49},{"n":561730,"d":"Commercial Landscape","s":"GA","y":2016,"r":1898579,"e":287723,"m":5.39},{"n":238220,"d":"HVAC Contractor","s":"MT","y":2016,"r":537729,"e":110234,"m":1.68},{"n":238170,"d":"Seamless Gutter Company","s":"FL","y":2016,"r":261528,"e":70793,"m":2.33},{"n":238160,"d":"Provider of Repairs and Installation of Roofing and Other Building Exterior Comp","s":"CO","y":2016,"r":2026057,"e":250489,"m":1.2},{"n":237210,"d":"Real Estate Surveyors","s":"TX","y":2016,"r":513190,"e":291363,"m":1.37},{"n":238350,"d":"Finish and Trim Carpentry","s":"CA","y":2016,"r":5104626,"e":1091393,"m":1.19},{"n":238220,"d":"Full Service Plumbing, Heating and Air Conditioning Company","s":"NJ","y":2016,"r":1744563,"e":365836,"m":2.73},{"n":238160,"d":"Roofing Contractor","s":"OK","y":2016,"r":752246,"e":228187,"m":3.94},{"n":449129,"d":"Custom Framing and Gift Shop","s":"WA","y":2016,"r":373643,"e":91909,"m":1.96},{"n":238990,"d":"Contractor Fencing","s":"FL","y":2016,"r":2514825,"e":299807,"m":2.67},{"n":238220,"d":"HVAC Contractor","s":"VA","y":2016,"r":4050731,"e":672751,"m":2.82},{"n":561720,"d":"Construction Cleanup","s":"FL","y":2016,"r":204939,"e":68153,"m":2.2},{"n":238220,"d":"Air Conditioning and Pool Heater Service, Repair, Maintenance, and Replacement B","s":"FL","y":2016,"r":537703,"e":144560,"m":2.14},{"n":561720,"d":"Construction Cleanup Services","s":"FL","y":2016,"r":238878,"e":52162,"m":1.76},{"n":238210,"d":"Professional Holiday Decorating and Christmas Lighting Installation","s":"FL","y":2016,"r":76878,"e":32306,"m":1.33},{"n":332323,"d":"Commercial Real Estate Construction","s":"TX","y":2016,"r":4926628,"e":1036872,"m":4.34},{"n":238220,"d":"Plumbing Company","s":"FL","y":2016,"r":1391191,"e":119163,"m":4.36},{"n":238220,"d":"Designs, Installs, Services, Repairs and Inspects Fire Sprinkler Systems","s":"FL","y":2016,"r":1431800,"e":231618,"m":1.68},{"n":238990,"d":"Screening Repair and Service Business","s":"FL","y":2016,"r":133869,"e":18659,"m":2.95},{"n":238210,"d":"Electrical Contractor Specializing in Commercial and Industrial Contracts","s":"TX","y":2016,"r":2071000,"e":422025,"m":3.67},{"n":561730,"d":"Landscaping Services","s":"IA","y":2016,"r":240614,"e":26828,"m":2.98},{"n":238990,"d":"Pool Construction and Paving Contractor","s":"FL","y":2016,"r":8334215,"e":573731,"m":1.81},{"n":561730,"d":"Residential Lawn Care and Landscaping Business","s":"FL","y":2016,"r":349304,"e":161096,"m":1.46},{"n":561730,"d":"Independent Landscape Business","s":"ID","y":2016,"r":349833,"e":127971,"m":1.99},{"n":238350,"d":"Manufacturer of Custom Cabinetry and Carpentry Projects","s":"ON","y":2016,"r":216366,"e":73576,"m":1.55},{"n":561730,"d":"Commercial and Residential Landscape Maintenance Company","s":"FL","y":2016,"r":399453,"e":105120,"m":2.52},{"n":238170,"d":"Seamless Gutter Company","s":"FL","y":2016,"r":877722,"e":265295,"m":1.84},{"n":561730,"d":"Landscaping Business","s":"FL","y":2016,"r":232220,"e":67878,"m":3.54},{"n":561730,"d":"Residential Lawn and Landscape Services","s":"NV","y":2016,"r":902264,"e":128225,"m":1.73},{"n":238220,"d":"Air Conditioning and Heating Business","s":"FL","y":2016,"r":1282585,"e":175391,"m":1.45},{"n":238350,"d":"Cabinet and Counter Top Installation Business","s":"FL","y":2016,"r":1293507,"e":224875,"m":1.13},{"n":238350,"d":"Cabinet and Counter Top Installation Business","s":"FL","y":2016,"r":860100,"e":155336,"m":1.64},{"n":238350,"d":"Custom Closet Company","s":"FL","y":2016,"r":813964,"e":116405,"m":3.31},{"n":238990,"d":"Radon Gas Alleviation Contractors","s":"MA","y":2016,"r":370883,"e":132064,"m":1.14},{"n":238990,"d":"Leak Detection Company","s":"FL","y":2016,"r":107905,"e":59752,"m":2.09},{"n":561730,"d":"Landscaping Service","s":"WY","y":2016,"r":1050000,"e":275000,"m":2.91},{"n":444240,"d":"Landscape and Greenhouse","s":"IL","y":2016,"r":1275273,"e":339688,"m":2.46},{"n":561730,"d":"Landscaping Services","s":"TX","y":2016,"r":143366,"e":28859,"m":1.21},{"n":236220,"d":"Renovations of Franchised Hotels","s":"NC","y":2016,"r":16151185,"e":1928006,"m":3.11},{"n":238390,"d":"Installs Garage Organization Systems","s":"TX","y":2016,"r":1369220,"e":300211,"m":3.0},{"n":444110,"d":"Retail Building Materials and Hardware Center","s":"ID","y":2016,"r":4241425,"e":711368,"m":2.17},{"n":238220,"d":"Fire Sprinkler Installer","s":"CA","y":2015,"r":18813689,"e":4485606,"m":2.23},{"n":238350,"d":"Door and Window Contractor","s":"FL","y":2015,"r":1029582,"e":164317,"m":2.74},{"n":423310,"d":"Lumber Wholesaler","s":"SC","y":2015,"r":12000000,"e":421800,"m":4.51},{"n":238150,"d":"Sells, Services, and Installs Decorative Door Glass, Doors, and Impact Glass","s":"FL","y":2015,"r":1029832,"e":181673,"m":2.48},{"n":541320,"d":"Landscaping","s":"GA","y":2015,"r":794341,"e":165312,"m":3.02},{"n":237990,"d":"Dock Repair Services","s":"FL","y":2015,"r":1191009,"e":352970,"m":1.78},{"n":332322,"d":"Precision Sheet Metal Fabrication","s":"CA","y":2015,"r":3590000,"e":325000,"m":0.46},{"n":238310,"d":"Commercial Acoustical Ceiling and Drywall Company","s":"FL","y":2015,"r":12212460,"e":3031177,"m":3.06},{"n":238210,"d":"Home Theater Installation Services","s":"TX","y":2015,"r":2055661,"e":134549,"m":5.2},{"n":238330,"d":"Commercial Flooring Contractors","s":"AZ","y":2015,"r":2900800,"e":608777,"m":2.3},{"n":238390,"d":"Basement Waterproofing and Restoration","s":"PA","y":2015,"r":5754829,"e":938678,"m":3.62},{"n":561730,"d":"Commercial Lawn Care and Landscaping","s":"FL","y":2015,"r":150289,"e":51557,"m":0.87},{"n":238210,"d":"Electrical Contractor","s":"UT","y":2015,"r":3671468,"e":705425,"m":1.98},{"n":561730,"d":"Landscaping Services","s":"OR","y":2015,"r":846487,"e":288852,"m":1.16},{"n":238220,"d":"Retail Water Treatment Systems and Installation Company","s":"MT","y":2015,"r":690698,"e":157114,"m":2.32},{"n":561730,"d":"Residential and Commercial Lawn Care and Landscaping","s":"FL","y":2015,"r":752196,"e":140936,"m":4.43},{"n":238220,"d":"Fire Sprinkler Contracting and Alarm Monitoring Company","s":"GA","y":2015,"r":6591086,"e":695769,"m":1.16},{"n":444110,"d":"Home Remodeling Center and General Contractor","s":"FL","y":2015,"r":903907,"e":70051,"m":1.56},{"n":236118,"d":"General Contractor","s":"FL","y":2015,"r":6208352,"e":279365,"m":3.76},{"n":561730,"d":"Commercial and Residential Landscaping Services","s":"MI","y":2015,"r":3268276,"e":593817,"m":2.02},{"n":561730,"d":"Commercial Landscape, Irrigation, and Pest Control Business","s":"FL","y":2015,"r":955289,"e":318329,"m":2.04},{"n":238990,"d":"Fence Installation Company","s":"FL","y":2015,"r":219411,"e":65636,"m":1.14},{"n":238220,"d":"Air Conditioning Contractor","s":"FL","y":2015,"r":884175,"e":133112,"m":3.76},{"n":541380,"d":"Nondestructive Testing Services for a Variety of Industries Including Constructi","s":"CA","y":2015,"r":1139713,"e":452395,"m":3.76},{"n":238210,"d":"Electrical Contractor","s":"CO","y":2015,"r":1130995,"e":424936,"m":1.24},{"n":561730,"d":"Landscape Maintenance","s":"CA","y":2015,"r":680243,"e":61383,"m":4.07},{"n":238210,"d":"Outdoor Lighting Company","s":"MO","y":2015,"r":325164,"e":73547,"m":2.86},{"n":238220,"d":"Plumbing Contractor","s":"FL","y":2015,"r":979956,"e":94547,"m":5.08},{"n":561730,"d":"Commercial Landscaping and Lawn Service Franchise","s":"FL","y":2015,"r":1641160,"e":357174,"m":2.58},{"n":561730,"d":"Residential Lawn Care and Landscaping","s":"FL","y":2015,"r":227099,"e":120956,"m":1.45},{"n":238990,"d":"Paving Contractor","s":"FL","y":2015,"r":1458725,"e":187864,"m":1.67},{"n":238990,"d":"Artificial Turf and Sport Flooring Installation","s":"ON","y":2015,"r":950085,"e":137664,"m":2.18},{"n":238220,"d":"Plumbing and Heating Contractor","s":"CO","y":2015,"r":3412105,"e":260938,"m":5.24},{"n":238220,"d":"Residential HVAC","s":"NC","y":2015,"r":2978520,"e":425620,"m":2.58},{"n":236118,"d":"Home Improvement Contractor","s":"FL","y":2015,"r":1926677,"e":92288,"m":2.06},{"n":561730,"d":"Landscaping","s":"FL","y":2015,"r":835963,"e":53389,"m":8.15},{"n":238990,"d":"Parking Lot Maintenance","s":"FL","y":2015,"r":129377,"e":99355,"m":1.76},{"n":238110,"d":"Concrete Paving Company","s":"CA","y":2015,"r":11567598,"e":161266,"m":5.58},{"n":238170,"d":"Sales, Installation and Service of New & Retrofit Gutters and Downspouts.  Resid","s":"TN","y":2015,"r":1537517,"e":323928,"m":3.76},{"n":236118,"d":"Home Improvement Contractor","s":"FL","y":2015,"r":464994,"e":112574,"m":2.31},{"n":238220,"d":"Plumber Contractor","s":"FL","y":2015,"r":2650000,"e":537000,"m":2.61},{"n":561730,"d":"Provider of Lawn and Landscaping Services","s":"FL","y":2015,"r":348434,"e":151072,"m":1.62},{"n":237130,"d":"Underground Utilities Construction","s":"CO","y":2015,"r":2508237,"e":164041,"m":7.62},{"n":561730,"d":"Commercial Property Maintenance and Landscaping Company","s":"ON","y":2015,"r":1842657,"e":420725,"m":2.97},{"n":238350,"d":"Window Installation","s":"MB","y":2015,"r":1582186,"e":696025,"m":1.01},{"n":561730,"d":"Landscaping/Tree Service","s":"FL","y":2015,"r":179000,"e":77464,"m":1.74},{"n":238220,"d":"Commercial Refrigeration and Heating, Ventilation, and Air Conditioning (HVAC) C","s":"CT","y":2015,"r":8228500,"e":1635900,"m":5.5},{"n":238220,"d":"Water Purification/Water Softener Sales and Service","s":"FL","y":2015,"r":295025,"e":71612,"m":2.79},{"n":236220,"d":"Commercial Interior Construction","s":"PA","y":2015,"r":2716267,"e":430625,"m":2.79},{"n":423710,"d":"Branded Distributor of Fasteners to Home Improvement, Hardware and Lumber Retail","s":"MT","y":2015,"r":13124268,"e":2414370,"m":6.01},{"n":561720,"d":"New Home Construction Cleaning Services","s":"CO","y":2015,"r":443969,"e":106914,"m":3.27},{"n":236118,"d":"Maintenance Management Service Focusing on High-End  Homes in Affluent Neighborh","s":"CA","y":2015,"r":3360773,"e":316571,"m":3.0},{"n":236220,"d":"General Contracting - Commercial","s":"PA","y":2015,"r":9192473,"e":917492,"m":0.93},{"n":238330,"d":"Specialty Flooring Installation Contractor","s":"ON","y":2015,"r":1750638,"e":502648,"m":1.39},{"n":238990,"d":"Central Vacuum, Closet Shelving, Home Automation, Home Security Systems","s":"CT","y":2015,"r":3706026,"e":1019245,"m":2.63},{"n":236118,"d":"Home Improvement Contractor","s":"FL","y":2015,"r":2247351,"e":677303,"m":2.81},{"n":221310,"d":"Lawn Irrigation Contractor","s":"FL","y":2015,"r":102000,"e":55000,"m":1.82},{"n":561730,"d":"Full-Service Landscape, Sprinkler Irrigation, Maintenance and Nursery","s":"MT","y":2015,"r":1968489,"e":374245,"m":2.0},{"n":238990,"d":"Interlocking Brick Paving Contractors","s":"FL","y":2015,"r":5347165,"e":618670,"m":1.45},{"n":238150,"d":"Glass Etching","s":"FL","y":2015,"r":811745,"e":314702,"m":2.26},{"n":236118,"d":"Water and Fire Damage/ Disaster Remediation and Restoration Franchise","s":"AL","y":2015,"r":1760600,"e":582593,"m":0.96},{"n":459999,"d":"Art and Picture Framing Franchise","s":"FL","y":2015,"r":364989,"e":62962,"m":1.03},{"n":236220,"d":"Grain Bin Construction","s":"IA","y":2015,"r":1651380,"e":220715,"m":2.69},{"n":327390,"d":"Construction of Concrete Roadside Furniture - On-Site","s":"QC","y":2015,"r":9300000,"e":2180000,"m":2.86},{"n":238990,"d":"Contractor Installer","s":"FL","y":2015,"r":821001,"e":122210,"m":3.4},{"n":238170,"d":"Gutter Installation","s":"FL","y":2015,"r":1113000,"e":254610,"m":1.63},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2015,"r":808454,"e":181795,"m":2.26},{"n":332322,"d":"Sheet Metal Fabrication","s":"WI","y":2015,"r":2002525,"e":385789,"m":1.56},{"n":561730,"d":"Provider of Lawn and Landscaping Services","s":"FL","y":2015,"r":84595,"e":69568,"m":0.93},{"n":238990,"d":"Manufactures and Installs Fencing","s":"FL","y":2015,"r":1300000,"e":154458,"m":3.95},{"n":561790,"d":"Fire Sprinkler Contractor","s":"CA","y":2015,"r":3923462,"e":994082,"m":2.46},{"n":238220,"d":"Plumber","s":"FL","y":2015,"r":303446,"e":29537,"m":3.22},{"n":561730,"d":"Lawn Care and Landscaping Services","s":"MB","y":2015,"r":712321,"e":295299,"m":2.27},{"n":238220,"d":"Residential and Commercial Heating and Cooling Services","s":"KS","y":2015,"r":3582709,"e":510476,"m":2.88},{"n":238220,"d":"Residential HVAC","s":"NC","y":2015,"r":1555769,"e":194796,"m":2.6},{"n":238210,"d":"Electrical Contractor","s":"FL","y":2015,"r":1330511,"e":375658,"m":1.01},{"n":561730,"d":"Landscape Maintenance","s":"GA","y":2015,"r":426993,"e":86443,"m":1.97},{"n":561730,"d":"Landscaping","s":"FL","y":2015,"r":309449,"e":82368,"m":1.82},{"n":561730,"d":"Landscaping","s":"FL","y":2015,"r":488698,"e":57451,"m":2.26},{"n":236118,"d":"General Contracting Services","s":"ON","y":2015,"r":223844,"e":38845,"m":1.42},{"n":238210,"d":"Utility Contractor","s":"CO","y":2015,"r":10165949,"e":4432168,"m":2.64},{"n":561730,"d":"Commercial Landscape Maintenance Services","s":"NV","y":2015,"r":2819049,"e":614136,"m":2.49},{"n":238150,"d":"Glass Company","s":"FL","y":2015,"r":1101513,"e":254907,"m":1.47},{"n":444240,"d":"Garden Center and Landscaping Contractor","s":"NY","y":2015,"r":1713024,"e":240832,"m":2.36},{"n":238160,"d":"Roofing Contractor","s":"CO","y":2015,"r":857665,"e":70623,"m":6.95},{"n":238220,"d":"Residential Plumbing Contractors","s":"TX","y":2015,"r":9096893,"e":1853876,"m":4.56},{"n":561730,"d":"Landscaping","s":"FL","y":2015,"r":1860952,"e":284763,"m":3.15},{"n":238210,"d":"Electric Contractor","s":"FL","y":2015,"r":2514548,"e":395380,"m":2.28},{"n":238910,"d":"Construction","s":"FL","y":2015,"r":279645,"e":59363,"m":6.32},{"n":238160,"d":"Roofing Contractor","s":"FL","y":2015,"r":200354,"e":50579,"m":1.29}];


// ── COMPS MATCHING ENGINE ──

function findBestComps(survey, valuation) {
  // Get target NAICS codes from sub-industry selection
  const subInd = CONSTRUCTION_SUB_INDUSTRIES.find(s => s.label === survey.subIndustry);
  const targetNaics = subInd ? subInd.naics : [];
  
  // Get the business's SDE (use high end for matching)
  const targetSDE = valuation.adjustedCashFlowHigh || valuation.adjustedCashFlowLow || 0;
  const targetRevenue = valuation.revenue || 0;
  const targetState = ""; // We don't collect state in survey currently
  const currentYear = new Date().getFullYear();
  const descriptionWords = (survey.businessName + " " + (survey.subIndustry || "")).toLowerCase().split(/\s+/);
  
  // Score each comp
  const scored = COMPS_DATA.map(comp => {
    let score = 0;
    
    // ── Priority 1: Industry/NAICS match (0-40 points) ──
    if (targetNaics.length > 0) {
      if (targetNaics.includes(comp.n)) {
        score += 40; // Exact NAICS match
      } else {
        // Check 3-digit prefix match (same broad category)
        const compPrefix = Math.floor(comp.n / 1000);
        const matchesPrefix = targetNaics.some(n => Math.floor(n / 1000) === compPrefix);
        if (matchesPrefix) score += 20;
        
        // Check 2-digit prefix (same sector)
        const compSector = Math.floor(comp.n / 10000);
        const matchesSector = targetNaics.some(n => Math.floor(n / 10000) === compSector);
        if (matchesSector && !matchesPrefix) score += 8;
      }
    } else {
      // No sub-industry selected — give partial credit to all construction (23xxxx)
      if (String(comp.n).startsWith("23")) score += 15;
    }
    
    // ── Priority 2: Business description similarity (0-25 points) ──
    const compDesc = comp.d.toLowerCase();
    const compWords = compDesc.split(/\s+/);
    let wordMatches = 0;
    descriptionWords.forEach(word => {
      if (word.length > 2 && compWords.some(cw => cw.includes(word) || word.includes(cw))) {
        wordMatches++;
      }
    });
    score += Math.min(25, wordMatches * 7);
    
    // ── Priority 3: SDE/Cash flow proximity (0-20 points) ──
    if (targetSDE > 0 && comp.e > 0) {
      const sdeRatio = Math.min(targetSDE, comp.e) / Math.max(targetSDE, comp.e);
      score += sdeRatio * 20;
    }
    // Revenue proximity bonus (0-5 points)
    if (targetRevenue > 0 && comp.r > 0) {
      const revRatio = Math.min(targetRevenue, comp.r) / Math.max(targetRevenue, comp.r);
      score += revRatio * 5;
    }
    
    // ── Priority 4: Sale date recency (0-8 points) ──
    const yearsAgo = currentYear - comp.y;
    score += Math.max(0, 8 - yearsAgo); // Full points for current year, -1 per year
    
    // ── Priority 5: Location bonus (0-2 points) ──
    // We don't collect state yet, so this is a placeholder
    // if (targetState && comp.s === targetState) score += 2;
    
    return { ...comp, score };
  });
  
  // Sort by score descending, take top 3
  scored.sort((a, b) => b.score - a.score);
  
  // Return top 3 with formatted data
  return scored.slice(0, 3).map(comp => ({
    description: comp.d,
    state: comp.s,
    year: comp.y,
    revenue: comp.r,
    cashFlow: comp.e,
    multiple: comp.m,
    cashFlowMargin: comp.r > 0 ? ((comp.e / comp.r) * 100).toFixed(1) : "0.0",
    score: comp.score
  }));
}


const EMPLOYEE_OPTIONS = [
  { value: "0", label: "Just me / partners", score: -0.15 },
  { value: "1-3", label: "1–3", score: -0.10 },
  { value: "4-5", label: "4–5", score: 0 },
  { value: "6-10", label: "6–10", score: 0.10 },
  { value: "10+", label: "10+", score: 0.15 }
];

const CUSTOMER_CONCENTRATION_OPTIONS = [
  { value: "no", label: "No", score: 0.25 },
  { value: "yes", label: "Yes", score: -0.50 }
];

const RECURRING_REVENUE_OPTIONS = [
  { value: "76-100", label: "76–100%", score: 0.25 },
  { value: "51-75", label: "51–75%", score: 0.15 },
  { value: "26-50", label: "26–50%", score: 0 },
  { value: "0-25", label: "0–25%", score: -0.15 }
];

const PL_TAX_ALIGNMENT_OPTIONS = [
  { value: "same", label: "No, they're essentially the same", score: 0.10 },
  { value: "slightly_different", label: "Slightly different", score: -0.05 },
  { value: "very_different", label: "Yes, materially different", score: -0.25 },
  { value: "unsure", label: "Not sure", score: 0 }
];

const SDE_MULTIPLES_BY_RANGE = [
  { max: 250000, min: 2.0, typical: 2.25, high: 2.5 },
  { max: 500000, min: 2.0, typical: 2.5, high: 3.0 },
  { max: 700000, min: 2.75, typical: 3.125, high: 3.5 },
  { max: 1000000, min: 3.0, typical: 3.5, high: 4.0 },
  { max: 2000000, min: 3.25, typical: 3.75, high: 4.25 },
  { max: 5000000, min: 4.25, typical: 4.875, high: 5.5 },
  { max: 10000000, min: 5.0, typical: 5.5, high: 6.0 },
  { max: Infinity, min: 5.5, typical: 6.0, high: 6.5 }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(amount) {
  const num = parseFloat(amount);
  if (isNaN(num) || amount === null || amount === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(num);
}

function formatCurrencyDetailed(amount) {
  const num = parseFloat(amount);
  if (isNaN(num) || amount === null || amount === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(num);
}

function parseCurrencyInput(value) {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.\-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function formatCompactCurrency(amount) {
  const num = parseFloat(amount);
  if (isNaN(num) || num === 0) return "$0";
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return formatCurrency(num);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ============================================================================
// VALUATION ENGINE — Core calculation logic
// ============================================================================

function getQualitativeAdjustment(survey) {
  let adjustment = 0;
  
  // Employee count
  const empOption = EMPLOYEE_OPTIONS.find(o => o.value === survey.employeeCount);
  if (empOption) adjustment += empOption.score;
  
  // Customer concentration
  const ccOption = CUSTOMER_CONCENTRATION_OPTIONS.find(o => o.value === survey.customerConcentration);
  if (ccOption) adjustment += ccOption.score;
  
  // Recurring revenue
  const rrOption = RECURRING_REVENUE_OPTIONS.find(o => o.value === survey.recurringRevenue);
  if (rrOption) adjustment += rrOption.score;
  
  // P&L vs tax alignment
  const plOption = PL_TAX_ALIGNMENT_OPTIONS.find(o => o.value === survey.plTaxAlignment);
  if (plOption) adjustment += plOption.score;
  
  return adjustment;
}

function getBaseMultiple(sde) {
  for (const range of SDE_MULTIPLES_BY_RANGE) {
    if (sde < range.max) {
      return { min: range.min, typical: range.typical, max: range.high };
    }
  }
  const last = SDE_MULTIPLES_BY_RANGE[SDE_MULTIPLES_BY_RANGE.length - 1];
  return { min: last.min, typical: last.typical, max: last.high };
}

function calculateValuation(financials, survey) {
  // ── STEP 1: Calculate Net Operating Income ──
  const revenue = Math.max(0, parseCurrencyInput(financials.revenue));
  const cogs = Math.max(0, parseCurrencyInput(financials.cogs));
  const operatingExpenses = Math.max(0, parseCurrencyInput(financials.operatingExpenses));
  
  // Validation guards
  if (revenue <= 0) {
    return { error: "Revenue must be greater than zero." };
  }
  if (cogs > revenue) {
    return { error: "Cost of Sales cannot exceed Revenue." };
  }
  
  const grossProfit = revenue - cogs;
  const noi = grossProfit - operatingExpenses;
  
  // ── STEP 2: Calculate Verified Adjustments ──
  // Owner salary is verified — it's what they confirmed they take from payroll
  const ownerSalary = Math.max(0, parseCurrencyInput(survey.ownerSalary));
  
  const verifiedAdjustments = [];
  if (ownerSalary > 0) {
    verifiedAdjustments.push({ 
      name: "Owner/Officer Salary", 
      amount: ownerSalary, 
      category: "Owner/Officer Salary" 
    });
  }
  
  // If Claude API extracted additional adjustments (from P&L upload)
  if (financials.extractedAdjustments && financials.extractedAdjustments.length > 0) {
    financials.extractedAdjustments.forEach(adj => {
      verifiedAdjustments.push({
        name: adj.name,
        amount: Math.max(0, parseCurrencyInput(adj.amount)),
        category: adj.category || "Other"
      });
    });
  }
  
  const totalVerified = verifiedAdjustments.reduce((sum, a) => sum + a.amount, 0);
  
  // ── STEP 3: Smart Categorization of Itemized Expenses ──
  // Fuzzy-match owner-entered items against known verifiable categories.
  // If a match is found AND P&L already extracted that category → discard (use P&L amount).
  // If a match is found but no P&L version exists → auto-promote to Verified.
  // If no match → stays as Unverified (owner-reported).
  
  const VERIFIABLE_KEYWORDS = {
    "Owner/Officer Benefits": [
      "owner benefits", "officer benefits", "owner health insurance",
      "officer health insurance", "owner medical", "officer medical",
      "owner life insurance", "officer life insurance", "owner dental",
      "officer dental", "owner vision", "owner disability",
      "owner insurance", "officer insurance", "shareholder benefits",
      "shareholder health", "shareholder insurance"
    ],
    "Interest Expense": [
      "interest", "int exp", "interest exp", "loan interest", "interest on loan",
      "interest payment", "bank interest", "mortgage interest", "line of credit interest",
      "loc interest", "note interest", "interest charges"
    ],
    "Depreciation": [
      "depreciation", "deprec", "depr", "dep exp", "depreciation exp",
      "depreciation expense", "asset depreciation", "depr expense", "depn"
    ],
    "Amortization": [
      "amortization", "amort", "amortiz", "amort exp", "amort expense",
      "amortization expense", "loan amortization", "goodwill amort"
    ],
    "Bad Debt": [
      "bad debt", "bad debts", "uncollectible", "uncollectable", "write off",
      "write-off", "writeoff", "doubtful accounts", "allowance for doubtful",
      "accounts written off"
    ],
    "Owner Travel": [
      "travel", "owner travel", "business travel", "travel expense",
      "travel & entertainment", "travel and entertainment", "t&e",
      "travel entertainment", "auto expense", "vehicle expense", "mileage",
      "car expense", "gas expense", "fuel expense"
    ],
    "Charitable Contributions": [
      "charitable", "contributions", "donation", "donations", "donate",
      "charity", "charitable contribution", "charitable giving", "giving",
      "philanthropic", "nonprofit", "non-profit", "501c3"
    ],
    "State Income Tax": [
      "state tax", "state income tax", "income tax", "state taxes",
      "franchise tax", "state franchise", "state income"
    ],
    "Profit Sharing": [
      "profit sharing", "profit-sharing", "401k", "401(k)", "retirement",
      "retirement plan", "pension", "employee retirement", "sep ira",
      "simple ira", "defined benefit", "defined contribution",
      "retirement contribution"
    ]
  };
  
  function fuzzyMatchCategory(description) {
    const normalized = description.toLowerCase().trim()
      .replace(/[^a-z0-9\s&()-]/g, "")  // strip special chars except &()-
      .replace(/\s+/g, " ");             // collapse whitespace
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [category, keywords] of Object.entries(VERIFIABLE_KEYWORDS)) {
      for (const keyword of keywords) {
        // Exact match of keyword within the description
        if (normalized === keyword || normalized.includes(keyword)) {
          const score = keyword.length / Math.max(normalized.length, 1);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = category;
          }
        }
        // Also check if description words appear in keyword (handles "deprec exp" matching "depreciation expense")
        const descWords = normalized.split(" ");
        const kwWords = keyword.split(" ");
        const matchingWords = descWords.filter(dw => 
          kwWords.some(kw => kw.startsWith(dw) || dw.startsWith(kw))
        );
        if (matchingWords.length > 0 && matchingWords.length >= Math.min(descWords.length, kwWords.length)) {
          const score = matchingWords.length / Math.max(descWords.length, 1) * 0.9;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = category;
          }
        }
      }
    }
    
    // Require a minimum confidence score to avoid false positives
    return bestScore >= 0.4 ? bestMatch : null;
  }
  
  // Build a set of categories already extracted from the P&L
  const existingVerifiedCategories = new Set(
    verifiedAdjustments.map(a => a.category)
  );
  
  const unverifiedAdjustments = [];
  if (survey.itemizedExpenses && survey.itemizedExpenses.length > 0) {
    survey.itemizedExpenses.forEach(exp => {
      const amount = parseCurrencyInput(exp.amount);
      if (exp.description && exp.description.trim() && amount > 0) {
        const matchedCategory = fuzzyMatchCategory(exp.description);
        
        if (matchedCategory) {
          // It's a verifiable category
          if (existingVerifiedCategories.has(matchedCategory)) {
            // P&L already has this — silently discard the manual entry
            // (P&L-extracted amount takes precedence)
          } else {
            // No P&L version — promote to Verified
            verifiedAdjustments.push({
              name: exp.description.trim(),
              amount: amount,
              category: matchedCategory
            });
            existingVerifiedCategories.add(matchedCategory);
          }
        } else {
          // Not a verifiable category — stays Unverified
          unverifiedAdjustments.push({
            name: exp.description.trim(),
            amount: amount,
            category: "Owner-Reported"
          });
        }
      }
    });
  }
  
  // Recalculate totalVerified after potential promotions
  const finalTotalVerified = verifiedAdjustments.reduce((sum, a) => sum + a.amount, 0);
  const totalUnverified = unverifiedAdjustments.reduce((sum, a) => sum + a.amount, 0);
  
  // ── STEP 4: SDE Calculations ──
  // Low End SDE = NOI + Verified adjustments only (including any promoted from itemized)
  const sdeLow = noi + finalTotalVerified;
  // High End SDE = NOI + Verified + Unverified adjustments
  const sdeHigh = noi + finalTotalVerified + totalUnverified;
  
  // Sanity check: SDE shouldn't be negative for a functioning business
  if (sdeLow < 0 && sdeHigh < 0) {
    return { 
      error: "The business appears to have negative cash flow even with adjustments. Please double-check your numbers.",
      details: { revenue, cogs, operatingExpenses, noi, totalVerified: finalTotalVerified, totalUnverified }
    };
  }
  
  // ── STEP 5: Cash Flow Multiple ──
  const qualitativeAdj = getQualitativeAdjustment(survey);
  // Use the higher SDE for multiple determination (benefits the seller in range placement)
  const sdeForMultiple = Math.max(sdeLow, sdeHigh, 0);
  const baseMultiple = getBaseMultiple(sdeForMultiple);
  
  const adjustedMultiple = Math.max(1.0, Math.min(8.0, 
    baseMultiple.typical + qualitativeAdj
  ));
  
  // Round to 2 decimal places
  const multiple = Math.round(adjustedMultiple * 100) / 100;
  
  // ── STEP 6: Valuation Range ──
  const adjustedCashFlowLow = Math.max(0, sdeLow);
  const adjustedCashFlowHigh = Math.max(0, sdeHigh);
  
  const valuationLow = Math.round(adjustedCashFlowLow * multiple);
  const valuationHigh = Math.round(adjustedCashFlowHigh * multiple);
  
  // ── STEP 7: Sanity Checks ──
  const warnings = [];
  
  if (ownerSalary > operatingExpenses * 0.8) {
    warnings.push("Owner salary is very high relative to operating expenses — please verify this amount.");
  }
  if (totalUnverified > revenue * 0.3) {
    warnings.push("Reported non-essential expenses seem high relative to revenue — documentation will be important.");
  }
  if (valuationHigh > revenue * 8) {
    warnings.push("High-end valuation exceeds 8x revenue — this is uncommon and may need verification.");
  }
  if (noi < 0) {
    warnings.push("Net Operating Income is negative before adjustments — the valuation relies heavily on add-backs.");
  }
  
  return {
    // Input numbers
    revenue,
    cogs,
    operatingExpenses,
    grossProfit,
    noi,
    
    // Adjustments
    verifiedAdjustments,
    unverifiedAdjustments,
    totalVerified: finalTotalVerified,
    totalUnverified,
    
    // Cash flow
    adjustedCashFlowLow,
    adjustedCashFlowHigh,
    
    // Multiple
    multiple,
    qualitativeAdj,
    baseMultiple: baseMultiple.typical,
    
    // Valuation
    valuationLow,
    valuationHigh,
    
    // Meta
    warnings,
    inputMethod: financials.inputMethod || "manual",
    calculatedAt: new Date().toISOString()
  };
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

// ── ZAPIER WEBHOOK → GOOGLE SHEETS ──
const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/11589813/uecri0s/";

async function sendToZapier(submission) {
  try {
    const s = submission.survey || {};
    const v = submission.valuation || {};
    const f = submission.financials || {};
    
    const expenses = (s.itemizedExpenses || [])
      .filter(e => e.description && e.amount)
      .map(e => `${e.description}: $${e.amount}`)
      .join("; ");

    const payload = {
      date: submission.date || new Date().toLocaleDateString(),
      name: s.ownerName || "",
      email: s.email || "",
      businessName: s.businessName || "",
      website: s.website || "",
      industry: s.subIndustry || "",
      ownerSalary: s.ownerSalary || 0,
      expectedValue: s.expectedValue || 0,
      employeeCount: s.employeeCount || "",
      customerConcentration: s.customerConcentration || "",
      recurringRevenue: s.recurringRevenue || "",
      plTaxAlignment: s.plTaxAlignment || "",
      revenue: v.revenue || 0,
      cogs: v.cogs || 0,
      operatingExpenses: v.operatingExpenses || 0,
      verifiedAdjustments: v.totalVerified || 0,
      unverifiedAdjustments: v.totalUnverified || 0,
      adjustedCashFlowLow: v.adjustedCashFlowLow || 0,
      adjustedCashFlowHigh: v.adjustedCashFlowHigh || 0,
      cashFlowMultiple: v.multiple || 0,
      valuationLow: v.valuationLow || 0,
      valuationHigh: v.valuationHigh || 0,
      nonEssentialExpenses: expenses
    };

    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log("✅ Sent to Zapier → Google Sheets");
      return { success: true };
    } else {
      console.error("Zapier responded with status:", response.status);
      return { success: false, error: "Status " + response.status };
    }
  } catch (e) {
    console.error("Zapier webhook failed:", e);
    return { success: false, error: e.message };
  }
}


// ============================================================================
// COMPONENT: Currency Input with formatting
// ============================================================================

function CurrencyInput({ value, onChange, placeholder, label, required, error }) {
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (value !== undefined && value !== null && value !== "") {
      const num = parseCurrencyInput(value);
      if (num > 0) {
        setDisplayValue(num.toLocaleString("en-US"));
      } else {
        setDisplayValue("");
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);
  
  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setDisplayValue(raw ? parseFloat(raw).toLocaleString("en-US") : "");
    onChange(raw ? parseFloat(raw) : "");
  };
  
  const handleFocus = () => {
    // Show raw number on focus for easy editing
    const num = parseCurrencyInput(value);
    setDisplayValue(num > 0 ? String(num) : "");
  };
  
  const handleBlur = () => {
    const num = parseCurrencyInput(value);
    if (num > 0) {
      setDisplayValue(num.toLocaleString("en-US"));
    } else {
      setDisplayValue("");
    }
  };
  
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className={`relative rounded-lg border ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'} focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all`}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || "0"}
          className="w-full pl-7 pr-4 py-3 bg-transparent rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ============================================================================
// COMPONENT: Welcome Screen
// ============================================================================

function WelcomeScreen({ onStart }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  
  const handleStart = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email";
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onStart({ ownerName: name.trim(), email: email.trim(), phone: phone.trim() });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg" style={{ backgroundColor: "#1a4a42" }}>
            <span className="text-white text-5xl" style={{ fontFamily: "'Georgia', serif", fontWeight: "400", lineHeight: "1" }}>b</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Georgia', serif" }}>
            Get a Free Valuation<br />from Baton
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Get an instant estimate of what your business could be worth. Takes about 3 minutes.
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 space-y-4">
          <div className="text-left">
            <label className="text-sm font-medium text-gray-400 block mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(prev => ({...prev, name: null})); }}
              className={`w-full bg-white/10 border ${errors.name ? 'border-red-400' : 'border-white/20'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20`}
              placeholder="John Smith"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>
          
          <div className="text-left">
            <label className="text-sm font-medium text-gray-400 block mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({...prev, email: null})); }}
              className={`w-full bg-white/10 border ${errors.email ? 'border-red-400' : 'border-white/20'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20`}
              placeholder="john@business.com"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>
          
          <div className="text-left">
            <label className="text-sm font-medium text-gray-400 block mb-2">
              Phone Number <span className="text-gray-600 text-xs font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        
        <button
          onClick={handleStart}
          className="w-full py-4 px-8 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold text-lg rounded-xl hover:from-teal-400 hover:to-teal-500 active:scale-[0.98] transition-all shadow-lg shadow-teal-500/25"
        >
          Get Started
          <ChevronRight size={20} className="inline ml-2" />
        </button>
        
        <p className="mt-6 text-xs text-gray-500">
          Powered by Baton · Valuations are estimates and not formal appraisals
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Survey Form (multi-page)
// ============================================================================

function SurveyForm({ onComplete, initialData }) {
  const [page, setPage] = useState(0);
  const defaults = {
    ownerName: "",
    email: "",
    businessName: "",
    website: "",
    industry: "Construction / Trades",
    subIndustry: "",
    expectedValue: "",
    ownerSalary: "",
    employeeCount: "",
    customerConcentration: "",
    recurringRevenue: "",
    plTaxAlignment: "",
    itemizedExpenses: [
      { id: generateId(), description: "", amount: "" },
      { id: generateId(), description: "", amount: "" },
      { id: generateId(), description: "", amount: "" }
    ]
  };
  const [data, setData] = useState({ ...defaults, ...(initialData || {}) });
  const [errors, setErrors] = useState({});
  
  const update = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };
  
  const updateExpense = (id, field, value) => {
    setData(prev => ({
      ...prev,
      itemizedExpenses: prev.itemizedExpenses.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };
  
  const addExpenseRow = () => {
    setData(prev => ({
      ...prev,
      itemizedExpenses: [...prev.itemizedExpenses, { id: generateId(), description: "", amount: "" }]
    }));
  };
  
  const removeExpenseRow = (id) => {
    setData(prev => ({
      ...prev,
      itemizedExpenses: prev.itemizedExpenses.filter(exp => exp.id !== id)
    }));
  };
  
  const validatePage = (pageNum) => {
    const newErrors = {};
    
    if (pageNum === 0) {
      if (!data.businessName.trim()) newErrors.businessName = "Business name is required";
      if (!data.subIndustry) newErrors.subIndustry = "Please select your industry";
    }
    
    if (pageNum === 1) {
      if (!data.ownerSalary && data.ownerSalary !== 0) newErrors.ownerSalary = "Please enter owner salary (enter 0 if none)";
      if (!data.employeeCount) newErrors.employeeCount = "Please select employee count";
    }
    
    if (pageNum === 2) {
      if (!data.customerConcentration) newErrors.customerConcentration = "Please answer this question";
      if (!data.recurringRevenue) newErrors.recurringRevenue = "Please select a range";
      if (!data.plTaxAlignment) newErrors.plTaxAlignment = "Please answer this question";
    }
    
    // Page 3 (itemized expenses) has no required fields
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validatePage(page)) {
      if (page === 3) {
        onComplete(data);
      } else {
        setPage(page + 1);
      }
    }
  };
  
  const handleBack = () => {
    if (page > 0) setPage(page - 1);
  };
  
  const pages = [
    // Page 0: Business Info
    () => (
      <div className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <Building2 size={20} className="text-teal-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Business</h2>
            <p className="text-sm text-gray-500">What do customers call your business, and where do they find you online?</p>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.businessName}
            onChange={e => update("businessName", e.target.value)}
            placeholder="Acme Services LLC"
            className={`w-full px-4 py-3 rounded-lg border ${errors.businessName ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all`}
          />
          {errors.businessName && <p className="text-xs text-red-600 mt-1">{errors.businessName}</p>}
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Website</label>
          <input
            type="text"
            value={data.website}
            onChange={e => update("website", e.target.value)}
            placeholder="www.acmeservices.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">
            Industry <span className="text-red-500">*</span>
          </label>
          <select
            value={data.subIndustry}
            onChange={e => update("subIndustry", e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${errors.subIndustry ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all bg-white`}
          >
            <option value="">Select your industry…</option>
            {CONSTRUCTION_SUB_INDUSTRIES.map(sub => (
              <option key={sub.label} value={sub.label}>{sub.label}</option>
            ))}
          </select>
          {errors.subIndustry && <p className="text-xs text-red-600 mt-1">{errors.subIndustry}</p>}
        </div>
        
        <CurrencyInput
          label="What do you think your business is worth?"
          value={data.expectedValue}
          onChange={v => update("expectedValue", v)}
          placeholder="Your best guess"
        />
        <p className="text-xs text-gray-500 -mt-3">Optional — we'll compare this to our calculation</p>
      </div>
    ),
    
    // Page 1: Compensation & Employees
    () => (
      <div className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <DollarSign size={20} className="text-teal-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Compensation & Team</h2>
            <p className="text-sm text-gray-500">Tell us about owner pay and your team</p>
          </div>
        </div>
        
        <CurrencyInput
          label="How much are you paying yourself and your co-owner(s) out of company payroll?"
          required
          value={data.ownerSalary}
          onChange={v => update("ownerSalary", v)}
          placeholder="Annual amount"
          error={errors.ownerSalary}
        />
        <p className="text-xs text-gray-500 -mt-3">Include all owners/partners — annual total</p>
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            How many full-time employees, contractors, or part-time employees outside of the partners? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {EMPLOYEE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => update("employeeCount", opt.value)}
                className={`py-2.5 px-3 text-sm font-medium rounded-lg border transition-all ${
                  data.employeeCount === opt.value
                    ? "border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/20"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.employeeCount && <p className="text-xs text-red-600 mt-1">{errors.employeeCount}</p>}
        </div>
      </div>
    ),
    
    // Page 2: Business Quality Questions
    () => (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <BarChart3 size={20} className="text-teal-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Business Health</h2>
            <p className="text-sm text-gray-500">These factors help determine your valuation multiple</p>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Do your top 3 customers account for more than 50% of revenue? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CUSTOMER_CONCENTRATION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => update("customerConcentration", opt.value)}
                className={`py-3 px-4 text-sm font-medium rounded-lg border transition-all ${
                  data.customerConcentration === opt.value
                    ? "border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/20"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.customerConcentration && <p className="text-xs text-red-600 mt-1">{errors.customerConcentration}</p>}
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            What % of your revenue is from recurring customers? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RECURRING_REVENUE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => update("recurringRevenue", opt.value)}
                className={`py-2.5 px-3 text-sm font-medium rounded-lg border transition-all ${
                  data.recurringRevenue === opt.value
                    ? "border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/20"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.recurringRevenue && <p className="text-xs text-red-600 mt-1">{errors.recurringRevenue}</p>}
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Does your P&L show materially different revenue and/or net income than your tax returns? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PL_TAX_ALIGNMENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => update("plTaxAlignment", opt.value)}
                className={`py-2.5 px-4 text-sm font-medium rounded-lg border transition-all text-left ${
                  data.plTaxAlignment === opt.value
                    ? "border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/20"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.plTaxAlignment && <p className="text-xs text-red-600 mt-1">{errors.plTaxAlignment}</p>}
        </div>
      </div>
    ),
    
    // Page 3: Itemized Non-Essential Expenses
    () => (
      <div className="space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <FileText size={20} className="text-amber-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Non-Essential Expenses</h2>
            <p className="text-sm text-gray-500">List any expenses that wouldn't continue under new ownership</p>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>Examples:</strong> One-time legal fees, personal travel, family member salaries for non-essential roles, 
            owner vehicle expenses, personal meals & entertainment, charitable contributions, etc.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
            <div className="col-span-7">Description</div>
            <div className="col-span-4">Annual Amount</div>
            <div className="col-span-1"></div>
          </div>
          
          {data.itemizedExpenses.map((exp, idx) => (
            <div key={exp.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-7">
                <input
                  type="text"
                  value={exp.description}
                  onChange={e => updateExpense(exp.id, "description", e.target.value)}
                  placeholder="e.g. One-time legal expense"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={exp.amount}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9.]/g, "");
                      updateExpense(exp.id, "amount", raw);
                    }}
                    placeholder="0"
                    className="w-full pl-6 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
              <div className="col-span-1 flex justify-center">
                {data.itemizedExpenses.length > 1 && (
                  <button
                    onClick={() => removeExpenseRow(exp.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={addExpenseRow}
          className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          <Plus size={16} />
          Add another row
        </button>
        
        {data.itemizedExpenses.some(e => e.amount) && (
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Total Non-Essential Expenses</span>
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(data.itemizedExpenses.reduce((sum, e) => sum + parseCurrencyInput(e.amount), 0))}
            </span>
          </div>
        )}
      </div>
    )
  ];
  
  const pageLabels = ["Business", "Compensation", "Health", "Expenses"];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            {pageLabels.map((label, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  idx < page ? "bg-teal-500 text-white" :
                  idx === page ? "bg-teal-600 text-white ring-4 ring-teal-100" :
                  "bg-gray-200 text-gray-500"
                }`}>
                  {idx < page ? <CheckCircle size={14} /> : idx + 1}
                </div>
                {idx < pageLabels.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-1 transition-all ${idx < page ? "bg-teal-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">Step {page + 1} of {pageLabels.length}</p>
        </div>
      </div>
      
      {/* Form Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-xl mx-auto">
          {pages[page]()}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-xl mx-auto flex justify-between">
          <button
            onClick={handleBack}
            disabled={page === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-500 active:scale-[0.98] transition-all"
          >
            {page === 4 ? "Continue to Financials" : "Next"}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Financial Input Screen
// ============================================================================

function FinancialInputScreen({ onComplete, surveyData, initialFinancials }) {
  const [method, setMethod] = useState(initialFinancials?.inputMethod === "upload" ? "upload" : "manual");
  const [financials, setFinancials] = useState(initialFinancials || { 
    revenue: "", cogs: "", operatingExpenses: "",
    inputMethod: "manual", extractedAdjustments: []
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [fileName, setFileName] = useState(null);
  
  const update = (field, value) => {
    setFinancials(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };
  
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setFileName(file.name);
    setIsUploading(true);
    setUploadStatus("Reading document…");
    
    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      
      setUploadStatus("Analyzing P&L with AI…");
      
      const mediaType = file.type === "application/pdf" ? "application/pdf" : 
                        file.type.startsWith("image/") ? file.type : "application/pdf";
      
      const contentBlock = mediaType === "application/pdf" 
        ? { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } }
        : { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              contentBlock,
              { type: "text", text: `Extract the following financial data from this P&L / Income Statement. Return ONLY a JSON object with no other text:

{
  "revenue": <number - total revenue/sales>,
  "cogs": <number - cost of goods sold / cost of sales. Use 0 if not present>,
  "operatingExpenses": <number - total operating expenses / total expenses EXCLUDING COGS>,
  "extractedAdjustments": [
    {"name": "<string>", "amount": <number>, "category": "<string>"}
  ]
}

For extractedAdjustments, look for these SDE-eligible items:
- Interest Expense
- Depreciation
- Amortization  
- Bad Debt
- Charitable Contributions/Donations
- One-time/Non-recurring expenses

IMPORTANT:
- All numbers should be positive (absolute values)
- Do NOT include owner salary in extractedAdjustments (we capture that separately)
- Only include adjustments you can clearly identify — do not guess
- If you cannot find a clear value, use 0 for that field
- Revenue should be total/gross revenue
- Operating expenses should NOT include COGS` }
            ]
          }]
        })
      });
      
      const result = await response.json();
      const text = result.content?.map(c => c.text || "").join("") || "";
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse financial data from document");
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate extracted data
      const rev = Math.abs(parseFloat(parsed.revenue) || 0);
      const cg = Math.abs(parseFloat(parsed.cogs) || 0);
      const opex = Math.abs(parseFloat(parsed.operatingExpenses) || 0);
      
      if (rev <= 0) throw new Error("Could not extract revenue from the document. Please try manual entry.");
      
      setFinancials({
        revenue: rev,
        cogs: cg,
        operatingExpenses: opex,
        inputMethod: "upload",
        extractedAdjustments: (parsed.extractedAdjustments || []).filter(a => a.amount > 0)
      });
      
      setUploadStatus("success");
      
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setErrors({ upload: err.message || "Failed to process document. Please try manual entry." });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };
  
  const validate = () => {
    const newErrors = {};
    const rev = parseCurrencyInput(financials.revenue);
    const cg = parseCurrencyInput(financials.cogs);
    const opex = parseCurrencyInput(financials.operatingExpenses);
    
    if (rev <= 0) newErrors.revenue = "Revenue is required and must be greater than 0";
    if (cg < 0) newErrors.cogs = "Cost of Sales cannot be negative";
    if (cg > rev) newErrors.cogs = "Cost of Sales cannot exceed Revenue";
    if (opex < 0) newErrors.operatingExpenses = "Operating Expenses cannot be negative";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validate()) {
      onComplete(financials);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-xl mx-auto">
          <h1 className="text-lg font-bold text-gray-900">Financial Information</h1>
          <p className="text-sm text-gray-500">Enter your P&L numbers or upload a document</p>
        </div>
      </div>
      
      <div className="flex-1 px-6 py-8">
        <div className="max-w-xl mx-auto space-y-6">
          {/* Method Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMethod("manual")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                method === "manual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Enter Manually
            </button>
            <button
              onClick={() => setMethod("upload")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                method === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Upload P&L
            </button>
          </div>
          
          {method === "upload" && (
            <div className="space-y-4">
              {/* Drop Zone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isUploading ? "border-teal-400 bg-teal-50" : 
                  uploadStatus === "success" ? "border-green-400 bg-green-50" :
                  uploadStatus === "error" ? "border-red-400 bg-red-50" :
                  "border-gray-300 bg-white hover:border-teal-400 hover:bg-teal-50/50"
                }`}
              >
                {isUploading ? (
                  <div className="space-y-3">
                    <Loader size={32} className="mx-auto text-teal-600 animate-spin" />
                    <p className="text-sm font-medium text-teal-700">{uploadStatus}</p>
                  </div>
                ) : uploadStatus === "success" ? (
                  <div className="space-y-3">
                    <CheckCircle size={32} className="mx-auto text-green-600" />
                    <p className="text-sm font-medium text-green-700">Successfully extracted from {fileName}</p>
                    <p className="text-xs text-green-600">Review the numbers below and adjust if needed</p>
                  </div>
                ) : uploadStatus === "error" ? (
                  <div className="space-y-3">
                    <AlertCircle size={32} className="mx-auto text-red-500" />
                    <p className="text-sm font-medium text-red-700">{errors.upload}</p>
                    <button 
                      onClick={() => { setUploadStatus(null); setErrors({}); }}
                      className="text-sm text-red-600 underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-700">Drag & drop your P&L here</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, image, or Excel file</p>
                    <label className="inline-block mt-4 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg cursor-pointer hover:bg-teal-100 transition-all">
                      Browse Files
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
                        onChange={e => handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
              
              {(uploadStatus === "success" || financials.revenue) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Tip:</strong> Review and adjust the extracted numbers below if anything looks off.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Financial Fields — always visible (populated by upload or manual entry) */}
          <div className="space-y-4">
            {method === "manual" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-blue-700">
                  Enter the high-level numbers from your most recent annual P&L / Income Statement.
                </p>
              </div>
            )}
            
            <CurrencyInput
              label="Revenue (Total Sales)"
              required
              value={financials.revenue}
              onChange={v => update("revenue", v)}
              placeholder="e.g. 500,000"
              error={errors.revenue}
            />
            
            <CurrencyInput
              label="Cost of Sales (COGS)"
              value={financials.cogs}
              onChange={v => update("cogs", v)}
              placeholder="e.g. 150,000"
              error={errors.cogs}
            />
            <p className="text-xs text-gray-500 -mt-2">Enter 0 if your business is service-based with no direct costs</p>
            
            <CurrencyInput
              label="Operating Expenses"
              required
              value={financials.operatingExpenses}
              onChange={v => update("operatingExpenses", v)}
              placeholder="e.g. 300,000"
              error={errors.operatingExpenses}
            />
            <p className="text-xs text-gray-500 -mt-2">Total expenses including payroll, rent, etc. (excluding COGS)</p>
            
            {/* Show extracted adjustments if any */}
            {financials.extractedAdjustments && financials.extractedAdjustments.length > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle size={14} />
                  Additional Adjustments Found in P&L
                </h4>
                {financials.extractedAdjustments.map((adj, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-green-700">{adj.name}</span>
                    <span className="font-medium text-green-800">{formatCurrency(adj.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Quick Preview */}
            {parseCurrencyInput(financials.revenue) > 0 && (
              <div className="mt-4 bg-gray-100 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Quick Preview</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue</span>
                  <span className="font-medium">{formatCurrency(financials.revenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gross Profit</span>
                  <span className="font-medium">{formatCurrency(parseCurrencyInput(financials.revenue) - parseCurrencyInput(financials.cogs))}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-300 pt-2">
                  <span className="text-gray-600">Net Operating Income</span>
                  <span className="font-bold">{formatCurrency(
                    parseCurrencyInput(financials.revenue) - parseCurrencyInput(financials.cogs) - parseCurrencyInput(financials.operatingExpenses)
                  )}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-xl mx-auto flex justify-between">
          <button
            onClick={() => onComplete(null)} // Signal to go back
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            <ChevronLeft size={16} />
            Back to Survey
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-500 active:scale-[0.98] transition-all"
          >
            Generate Valuation
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Processing Screen
// ============================================================================

function ProcessingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    "Analyzing your financial data…",
    "Calculating Seller's Discretionary Earnings…",
    "Determining cash flow multiple…",
    "Applying qualitative adjustments…",
    "Generating your valuation report…"
  ];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto rounded-full border-4 border-teal-500/30 border-t-teal-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 size={28} className="text-teal-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Georgia', serif" }}>
          Calculating Your Valuation
        </h2>
        <p className="text-gray-400 text-sm transition-all duration-300" key={messageIndex}>
          {messages[messageIndex]}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Valuation Report
// ============================================================================

function ValuationReport({ valuation, survey, comps, onStartOver, onEditSurvey, onEditFinancials }) {
  const [expandVerified, setExpandVerified] = useState(false);
  const [expandUnverified, setExpandUnverified] = useState(false);
  
  const reportDate = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const dataDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();
  
  const expectedValue = parseCurrencyInput(survey.expectedValue);
  const hasExpectedValue = expectedValue > 0;
  
  // Bar chart logic — find max across all 3 values for scaling
  const allBarValues = [valuation.valuationLow, valuation.valuationHigh];
  if (hasExpectedValue) allBarValues.push(expectedValue);
  const maxBarValue = Math.max(...allBarValues, 1);
  
  // Format for bar labels
  const barLabel = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return formatCurrency(val);
  };
  
  // Y-axis ticks
  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(Math.round((maxBarValue * i) / tickCount));
  }
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f5f0" }}>
      {/* Top Action Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-1">
          <button
            onClick={onEditSurvey}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            Edit Survey
          </button>
          <button
            onClick={onEditFinancials}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            Edit Financials
          </button>
        </div>
        <button
          onClick={onStartOver}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RotateCcw size={14} />
          New
        </button>
      </div>
      
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Report Header */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
            Your valuation report
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Data as of {dataDate}</p>
        </div>
        
        {/* Main Valuation Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-gray-900">{survey.businessName}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">(Valued at)</p>
            <p className="text-3xl font-bold mt-2" style={{ fontFamily: "'Georgia', serif", color: "#2a7d6f" }}>
              {formatCurrency(valuation.valuationLow)} –
            </p>
            <p className="text-3xl font-bold" style={{ fontFamily: "'Georgia', serif", color: "#2a7d6f" }}>
              {formatCurrency(valuation.valuationHigh)}
            </p>
            <p className="text-xs text-gray-400 italic mt-2">(Does not include unsold inventory or real estate)</p>
          </div>
        </div>
        
        {/* Valuation Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Georgia', serif" }}>Valuation Breakdown</h2>
          
          {/* Compare Your Valuations — 3-bar chart */}
          <div className="rounded-xl p-5 mt-5 mb-6" style={{ backgroundColor: "#f5f5f0" }}>
            <div className="flex gap-6 items-start">
              {/* Left side: text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-2">Compare your valuations</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your valuation may change if we identify add-backs during the go-to-market review; providing additional financial documents yields a more accurate, robust valuation than a single file.
                </p>
              </div>
              
              {/* Right side: vertical bar chart */}
              <div className="flex-shrink-0">
                {(() => {
                  const chartHeight = 180;
                  const barH = (val) => Math.max(Math.round((val / maxBarValue) * chartHeight), 24);
                  
                  const bars = [];
                  if (hasExpectedValue) {
                    bars.push({ label: "Your\nAnswer", value: expectedValue, color: "#4a5568" });
                  }
                  bars.push({ label: "Low\nEnd", value: valuation.valuationLow, color: "#3d9b8f" });
                  bars.push({ label: "High\nEnd", value: valuation.valuationHigh, color: "#2a7d6f" });
                  
                  return (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: `${chartHeight + 40}px`, paddingTop: "20px" }}>
                      {/* Y-axis */}
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: `${chartHeight}px`, paddingRight: "4px" }}>
                        {[...yTicks].reverse().map((tick, i) => (
                          <span key={i} style={{ fontSize: "9px", color: "#9ca3af", lineHeight: "1", textAlign: "right", whiteSpace: "nowrap" }}>
                            {barLabel(tick)}
                          </span>
                        ))}
                      </div>
                      
                      {/* Bars */}
                      {bars.map((bar, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{ 
                            height: `${chartHeight}px`, 
                            display: "flex", 
                            flexDirection: "column", 
                            justifyContent: "flex-end" 
                          }}>
                            <div style={{
                              width: "44px",
                              height: `${barH(bar.value)}px`,
                              backgroundColor: bar.color,
                              borderRadius: "4px 4px 0 0",
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "center",
                              paddingTop: "4px",
                              position: "relative"
                            }}>
                              <span style={{ 
                                fontSize: "10px", 
                                fontWeight: "700", 
                                color: "white",
                                position: barH(bar.value) < 36 ? "absolute" : "static",
                                top: barH(bar.value) < 36 ? "-18px" : undefined,
                                color: barH(bar.value) < 36 ? bar.color : "white",
                                whiteSpace: "nowrap"
                              }}>
                                {barLabel(bar.value)}
                              </span>
                            </div>
                          </div>
                          <div style={{ fontSize: "9px", color: "#6b7280", textAlign: "center", marginTop: "6px", lineHeight: "1.2" }}>
                            {bar.label.split("\n").map((l, j) => <div key={j}>{l}</div>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          
          {/* Line Items */}
          <div className="space-y-0">
            {/* Report Date */}
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest" style={{ fontSize: "11px" }}>Report Date</span>
              <span className="text-sm text-gray-600">{reportDate}</span>
            </div>
            
            {/* Revenue */}
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">Revenue</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(valuation.revenue)}</span>
            </div>
            
            {/* COGS */}
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">Cost of Sales</span>
              <span className="text-sm text-gray-700">{valuation.cogs > 0 ? `(${formatCurrency(valuation.cogs)})` : "$0"}</span>
            </div>
            
            {/* Operating Expenses */}
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">Operating Expenses</span>
              <span className="text-sm text-gray-700">({formatCurrency(valuation.operatingExpenses)})</span>
            </div>
            
            {/* Verified Adjustments */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => setExpandVerified(!expandVerified)}
                className="w-full flex justify-between items-center py-3 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-bold text-gray-900">Verified Adjustments</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(valuation.totalVerified)}</span>
                  {valuation.verifiedAdjustments.length > 0 && (
                    expandVerified ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandVerified && valuation.verifiedAdjustments.length > 0 && (
                <div className="pb-3 pl-6 space-y-1">
                  {valuation.verifiedAdjustments.map((adj, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500">{adj.name}</span>
                      <span className="text-gray-600">{formatCurrency(adj.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Unverified Adjustments */}
            {valuation.totalUnverified > 0 && (
              <div className="border-b border-gray-100">
                <button
                  onClick={() => setExpandUnverified(!expandUnverified)}
                  className="w-full flex justify-between items-center py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Unverified Adjustments
                    <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlertCircle size={10} className="text-amber-600" />
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(valuation.totalUnverified)}</span>
                    {expandUnverified ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </div>
                </button>
                
                {expandUnverified && (
                  <div className="pb-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2 ml-6">
                      <p className="text-xs text-amber-800 italic">
                        These add-backs are owner-reported but require additional documentation for SBA verification.
                      </p>
                    </div>
                    <div className="pl-6 space-y-1">
                      {valuation.unverifiedAdjustments.map((adj, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-500">{adj.name}</span>
                          <span className="text-gray-600">{formatCurrency(adj.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Teal divider line */}
            <div style={{ height: "2px", backgroundColor: "#2a7d6f", margin: "0" }} />
            
            {/* Adjusted Cash Flow */}
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">Adjusted Cash Flow</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(valuation.adjustedCashFlowLow)}{valuation.adjustedCashFlowLow !== valuation.adjustedCashFlowHigh ? ` – ${formatCurrency(valuation.adjustedCashFlowHigh)}` : ""}
              </span>
            </div>
            
            {/* Cash Flow Multiple */}
            <div className="flex justify-between py-3">
              <span className="text-sm font-bold text-gray-900">Cash Flow Multiple</span>
              <span className="text-sm font-bold text-gray-900">{valuation.multiple.toFixed(2)}X</span>
            </div>
            
            {/* Teal divider line */}
            <div style={{ height: "2px", backgroundColor: "#2a7d6f", margin: "0" }} />
            
            {/* Valuation */}
            <div className="flex justify-between items-center py-4">
              <span className="text-xl font-bold" style={{ fontFamily: "'Georgia', serif", color: "#2a7d6f" }}>Valuation</span>
              <span className="text-xl font-bold" style={{ color: "#2a7d6f" }}>
                {formatCurrency(valuation.valuationLow)}{valuation.valuationLow !== valuation.valuationHigh ? ` – ${formatCurrency(valuation.valuationHigh)}` : ""}
              </span>
            </div>
          </div>
        </div>
        
        {/* Understanding Your Valuation Range */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Understanding Your Valuation Range:</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <strong>Low End ({formatCurrency(valuation.valuationLow)}):</strong> Based on verified add-backs with SBA-compliant documentation
            </p>
            <p className="text-sm text-gray-700">
              <strong>High End ({formatCurrency(valuation.valuationHigh)}):</strong> Includes owner-reported expenses requiring additional documentation
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-4 leading-relaxed">
            To achieve the high-end valuation, please provide supporting documentation for unverified add-backs (receipts, invoices, statements, etc.).
          </p>
        </div>
        
        {/* What Influenced Your Valuation */}
        {(() => {
          const factors = [];
          
          const empOption = EMPLOYEE_OPTIONS.find(o => o.value === survey.employeeCount);
          if (empOption) {
            const s = empOption.score;
            factors.push({
              name: "Team Size",
              score: s,
              explanation: s > 0
                ? "Having a larger team signals the business doesn't depend solely on the owner to operate, making it more attractive to buyers."
                : s < 0
                ? "A smaller team means the business may rely heavily on the owner, which can make the transition to a new owner more difficult."
                : "Your team size is typical for businesses in this range and has a neutral effect on valuation."
            });
          }
          
          const ccOption = CUSTOMER_CONCENTRATION_OPTIONS.find(o => o.value === survey.customerConcentration);
          if (ccOption) {
            const s = ccOption.score;
            factors.push({
              name: "Customer Concentration",
              score: s,
              explanation: s > 0
                ? "Your revenue is spread across many customers, which reduces risk — if one leaves, the business stays healthy."
                : "Having a large share of revenue tied to a few customers is a risk. If a key customer leaves, it could significantly impact the business."
            });
          }
          
          const rrOption = RECURRING_REVENUE_OPTIONS.find(o => o.value === survey.recurringRevenue);
          if (rrOption) {
            const s = rrOption.score;
            factors.push({
              name: "Recurring Revenue",
              score: s,
              explanation: s > 0
                ? "A high percentage of repeat customers means more predictable future income, which buyers value highly."
                : s < 0
                ? "A lower rate of recurring customers means revenue is less predictable, making it harder for a buyer to forecast future earnings."
                : "Your repeat customer rate is moderate and has a neutral effect on valuation."
            });
          }
          
          const plOption = PL_TAX_ALIGNMENT_OPTIONS.find(o => o.value === survey.plTaxAlignment);
          if (plOption && plOption.score !== 0) {
            const s = plOption.score;
            factors.push({
              name: "Financial Record Consistency",
              score: s,
              explanation: s > 0
                ? "Your P&L and tax returns tell the same story, which builds buyer confidence and makes due diligence smoother."
                : "Discrepancies between your P&L and tax returns can raise red flags during due diligence and may cause buyers to discount their offer."
            });
          }
          
          const drivers = factors.filter(f => f.score > 0);
          const limiters = factors.filter(f => f.score < 0);
          const neutrals = factors.filter(f => f.score === 0);
          
          return (drivers.length > 0 || limiters.length > 0) ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: "'Georgia', serif" }}>
                What Influenced Your Valuation
              </h2>
              <p className="text-xs text-gray-500 mb-4">Based on your survey responses, these factors adjusted your cash flow multiple.</p>
              
              <div className="space-y-3">
                {drivers.map((f, i) => (
                  <div key={"d"+i} className="flex gap-3 p-3 rounded-xl" style={{ backgroundColor: "#f0faf8" }}>
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#2a7d6f" }}>
                        <ChevronUp size={14} className="text-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#d5f0eb", color: "#1a5c52" }}>Driver</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{f.explanation}</p>
                    </div>
                  </div>
                ))}
                
                {limiters.map((f, i) => (
                  <div key={"l"+i} className="flex gap-3 p-3 rounded-xl bg-amber-50">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-amber-500">
                        <ChevronDown size={14} className="text-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Limiter</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{f.explanation}</p>
                    </div>
                  </div>
                ))}
                
                {neutrals.map((f, i) => (
                  <div key={"n"+i} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-400">
                        <span className="text-white text-xs font-bold">—</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Neutral</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{f.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}
        
        {/* Selected Comparables */}
        {comps && comps.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6" style={{ fontFamily: "'Georgia', serif" }}>
              Selected Comparables
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {comps.map((comp, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 leading-snug" style={{ minHeight: "2.5rem" }}>
                    {comp.description}
                  </h4>
                  <div className="flex justify-center mb-2">
                    <span className="px-3 py-0.5 text-xs font-bold uppercase rounded-full" 
                      style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                      Similar
                    </span>
                  </div>
                  <div className="text-center rounded-lg p-3 mb-3" style={{ backgroundColor: "#f0f7f5" }}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cash Flow Multiple</p>
                    <p className="text-2xl font-bold text-gray-900">{comp.multiple.toFixed(2)}X</p>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Revenue:</span>
                      <span className="font-semibold text-gray-900">{formatCompactCurrency(comp.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cash Flow:</span>
                      <span className="font-semibold text-gray-900">{formatCompactCurrency(comp.cashFlow)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cash Flow Margin:</span>
                      <span className="font-semibold text-gray-900">{comp.cashFlowMargin}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Warnings */}
        {valuation.warnings && valuation.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              Notes
            </h3>
            <div className="space-y-2">
              {valuation.warnings.map((w, i) => (
                <p key={i} className="text-sm text-amber-700">{w}</p>
              ))}
            </div>
          </div>
        )}
        
        {/* Footer Disclaimer */}
        <div className="text-center pb-8">
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
            This valuation is an estimate based on the information provided and is not a formal business appraisal. 
            Actual value may vary based on market conditions, due diligence findings, and buyer preferences.
          </p>
          <p className="text-xs text-gray-300 mt-3">Powered by Baton</p>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// MAIN APP
// ============================================================================

export default function ConventionValuationApp() {
  const [step, setStep] = useState("welcome"); // welcome | survey | financials | processing | report
  const [welcomeData, setWelcomeData] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [valuationResult, setValuationResult] = useState(null);
  const [compsResult, setCompsResult] = useState(null);
  
  // Handle welcome screen completion
  const handleWelcomeComplete = (data) => {
    setWelcomeData(data);
    setStep("survey");
  };
  
  // Handle survey completion
  const handleSurveyComplete = (data) => {
    setSurveyData(data);
    setStep("financials");
  };
  
  // Handle financial input completion (or back navigation)
  const handleFinancialsComplete = async (data) => {
    if (data === null) {
      // User clicked "Back to Survey"
      setStep("survey");
      return;
    }
    
    setFinancialData(data);
    setStep("processing");
    
    // Run valuation engine
    const result = calculateValuation(data, surveyData);
    
    // Simulate processing time for UX polish
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    if (result.error) {
      alert("Valuation Error: " + result.error);
      setStep("financials");
      return;
    }
    
    setValuationResult(result);
    
    // Find best comparable transactions
    const bestComps = findBestComps(surveyData, result);
    setCompsResult(bestComps);
    
    // Send to Google Sheets via Zapier webhook
    const submission = {
      id: generateId(),
      date: new Date().toLocaleDateString(),
      survey: surveyData,
      financials: {
        revenue: result.revenue,
        cogs: result.cogs,
        operatingExpenses: result.operatingExpenses,
        inputMethod: data.inputMethod
      },
      valuation: result
    };
    
    // Fire and forget — don't block the report
    sendToZapier(submission).then(res => {
      if (res.success) console.log("✅ Data sent to Google Sheets");
      else console.warn("⚠️ Webhook failed:", res.error);
    });
    
    setStep("report");
  };
  
  // Start over
  const handleStartOver = () => {
    setWelcomeData(null);
    setSurveyData(null);
    setFinancialData(null);
    setValuationResult(null);
    setCompsResult(null);
    setStep("welcome");
  };
  
  // Edit navigation — go back to a step with data preserved
  const handleEditSurvey = () => setStep("survey");
  const handleEditFinancials = () => setStep("financials");
  
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {step === "welcome" && (
        <WelcomeScreen onStart={handleWelcomeComplete} />
      )}
      
      {step === "survey" && (
        <SurveyForm 
          onComplete={handleSurveyComplete} 
          initialData={surveyData ? surveyData : welcomeData ? { ownerName: welcomeData.ownerName, email: welcomeData.email } : null} 
        />
      )}
      
      {step === "financials" && (
        <FinancialInputScreen onComplete={handleFinancialsComplete} surveyData={surveyData} initialFinancials={financialData} />
      )}
      
      {step === "processing" && <ProcessingScreen />}
      
      {step === "report" && valuationResult && (
        <ValuationReport 
          valuation={valuationResult} 
          survey={surveyData}
          comps={compsResult}
          onStartOver={handleStartOver}
          onEditSurvey={handleEditSurvey}
          onEditFinancials={handleEditFinancials}
        />
      )}
    </div>
  );
}
