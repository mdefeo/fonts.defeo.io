"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Clipboard, Check, Search, Loader2, Italic, Underline, StrikethroughIcon, Plus } from "lucide-react"
import ContentEditable from "@/components/content-editable"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const FONT_CATEGORIES = [
  { value: "all", label: "All Fonts" },
  { value: "sans serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "display", label: "Display" },
  { value: "handwriting", label: "Handwriting" },
]

const CSS_UNITS = [
  { value: "px", label: "Pixels (px)" },
  { value: "rem", label: "Rem (rem)" },
  { value: "em", label: "Em (em)" },
  { value: "%", label: "Percentages (%)" },
  { value: "vh", label: "Viewport height (vh)" },
  { value: "vw", label: "Viewport width (vw)" },
  { value: "ch", label: "Character width (ch)" },
]

const FONT_WEIGHTS = [
  { value: "100", label: "Thin (100)" },
  { value: "200", label: "Extra Light (200)" },
  { value: "300", label: "Light (300)" },
  { value: "400", label: "Regular (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semi Bold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "Extra Bold (800)" },
  { value: "900", label: "Black (900)" },
]

const DEFAULT_HEADING = "The quick brown fox jumps over the lazy dog"
const DEFAULT_PARAGRAPH =
  "The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

const UNIT_RANGES = {
  px: {
    fontSize: { min: 12, max: 72, step: 1 },
    letterSpacing: { min: -2, max: 10, step: 0.5 },
    wordSpacing: { min: -5, max: 20, step: 1 },
  },
  rem: {
    fontSize: { min: 0.75, max: 4.5, step: 0.125 },
    letterSpacing: { min: -0.125, max: 0.625, step: 0.0625 },
    wordSpacing: { min: -0.3125, max: 1.25, step: 0.0625 },
  },
  em: {
    fontSize: { min: 0.75, max: 4.5, step: 0.125 },
    letterSpacing: { min: -0.125, max: 0.625, step: 0.0625 },
    wordSpacing: { min: -0.3125, max: 1.25, step: 0.0625 },
  },
  "%": {
    fontSize: { min: 75, max: 450, step: 5 },
    letterSpacing: { min: -5, max: 25, step: 1 },
    wordSpacing: { min: -10, max: 50, step: 2 },
  },
  vh: {
    fontSize: { min: 1, max: 10, step: 0.25 },
    letterSpacing: { min: -0.25, max: 1.5, step: 0.125 },
    wordSpacing: { min: -0.5, max: 3, step: 0.25 },
  },
  vw: {
    fontSize: { min: 1, max: 10, step: 0.25 },
    letterSpacing: { min: -0.25, max: 1.5, step: 0.125 },
    wordSpacing: { min: -0.5, max: 3, step: 0.25 },
  },
  ch: {
    fontSize: { min: 1, max: 10, step: 0.25 },
    letterSpacing: { min: -0.25, max: 1.5, step: 0.125 },
    wordSpacing: { min: -0.5, max: 3, step: 0.25 },
  },
}

const LINE_HEIGHT_RANGE = { min: 1, max: 2.5, step: 0.1 }

const getAvailableWeights = (fontFamily: string, fonts: any[]): string[] => {
  const font = fonts.find((f) => f.family === fontFamily)
  if (!font || !font.variants || font.variants.length === 0) return ["400", "700"] 

  const weights = font.variants
    .map((variant: string) => {
      if (variant === "regular") return "400"
      if (variant === "italic") return "400"
      const match = variant.match(/^(\d+)/)
      return match ? match[1] : null
    })
    .filter((weight: string | null) => weight !== null)

  return [...new Set(weights)]
}

const hasItalicVariant = (fontFamily: string, fonts: any[]): boolean => {
  const font = fonts.find((f) => f.family === fontFamily)
  if (!font || !font.variants || font.variants.length === 0) return true

  return font.variants.some((variant: string) => variant.includes("italic"))
}

const FontLoader = {
  loadedFonts: new Set<string>(),
  loadingErrors: new Map<string, string>(),

  loadFont: (fontFamily: string, weight = "400", isItalic = false): void => {
    const fontKey = `${fontFamily}:${weight}:${isItalic ? "italic" : "normal"}`
    if (FontLoader.loadedFonts.has(fontKey)) return
    if (FontLoader.loadingErrors.has(fontKey)) return

    try {
      const link = document.createElement("link")
      link.rel = "stylesheet"

      const fontStyle = isItalic ? "ital,wght@1," + weight : "wght@" + weight
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:${fontStyle}&display=swap`

      link.onload = () => {
        console.log(`Font loaded: ${fontFamily} (${weight}${isItalic ? " italic" : ""})`)
        FontLoader.loadedFonts.add(fontKey)
      }

      link.onerror = (err) => {
        console.error(`Error loading font ${fontFamily} (${weight}${isItalic ? " italic" : ""}):`, err)
        FontLoader.loadingErrors.set(fontKey, `Failed to load ${fontFamily} with weight ${weight}`)

        if (weight !== "400" && !FontLoader.loadedFonts.has(`${fontFamily}:400:${isItalic ? "italic" : "normal"}`)) {
          console.log(`Attempting to load ${fontFamily} with fallback weight 400`)
          FontLoader.loadFont(fontFamily, "400", isItalic)
        }
      }

      document.head.appendChild(link)
    } catch (error) {
      console.error(`Error loading font ${fontFamily}:`, error)
      FontLoader.loadingErrors.set(fontKey, `Exception loading ${fontFamily}`)
    }
  },

  loadFontConfigs: (configs: Array<{ family: string; weight: string; isItalic: boolean }>): void => {
    configs.forEach(({ family, weight, isItalic }) => FontLoader.loadFont(family, weight, isItalic))
  },

  isWeightAvailable: (fontFamily: string, weight: string, fonts: any[]): boolean => {
    const font = fonts.find((f) => f.family === fontFamily)
    if (!font || !font.variants || font.variants.length === 0) return false

    return font.variants.some((variant: string) => {
      if (weight === "400" && variant === "regular") return true
      return variant === weight || variant.startsWith(weight + "italic")
    })
  },
}

let googleFontsCache: any[] | null = null

async function fetchAllGoogleFonts() {
  if (googleFontsCache) {
    return googleFontsCache
  }

  try {
    const response = await fetch(
      "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAOES8EmKhuJEnsn9kS1XKBpxxp-TgN8Jc",
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch fonts: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    const allFonts = data.items || []

    const sortedFonts = [...allFonts].sort((a, b) => a.family.localeCompare(b.family))

    googleFontsCache = sortedFonts

    return sortedFonts
  } catch (error) {
    console.error("Error fetching Google Fonts:", error)
    return []
  }
}

async function fetchGoogleFontsBatch(page = 0, pageSize = 20, category?: string) {
  try {
    const allFonts = await fetchAllGoogleFonts()

    const filteredFonts =
      category && category !== "all"
        ? allFonts.filter((font: any) => {
            const fontCategory = font.category?.toLowerCase() || ""
            if (category === "sans serif" && (fontCategory === "sans-serif" || fontCategory === "sans serif")) {
              return true
            }
            return fontCategory === category
          })
        : allFonts

    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize
    const fontsBatch = filteredFonts.slice(startIndex, endIndex)

    return {
      fonts: fontsBatch,
      hasMore: endIndex < filteredFonts.length,
      totalFonts: filteredFonts.length,
      totalLoaded: Math.min(endIndex, filteredFonts.length),
    }
  } catch (error) {
    console.error("Error fetching Google Fonts:", error)
    return {
      fonts: [],
      hasMore: false,
      totalFonts: 0,
      totalLoaded: 0,
    }
  }
}

async function fetchTotalFontCount(category?: string) {
  try {
    const allFonts = await fetchAllGoogleFonts()

    if (category && category !== "all") {
      return allFonts.filter((font: any) => {
        const fontCategory = font.category?.toLowerCase() || ""
        if (category === "sans serif" && (fontCategory === "sans-serif" || fontCategory === "sans serif")) {
          return true
        }
        return fontCategory === category
      }).length
    }

    return allFonts.length
  } catch (error) {
    console.error("Error fetching font count:", error)
    return 0
  }
}

function FontSelect({
  value,
  onValueChange,
  fonts,
  isLoading,
  id,
  onLoadMore,
  isLoadingMore,
  hasMoreFonts,
  totalLoaded,
  totalFonts,
}: {
  value: string
  onValueChange: (value: string) => void
  fonts: any[]
  isLoading: boolean
  id: string
  onLoadMore: () => void
  isLoadingMore: boolean
  hasMoreFonts: boolean
  totalLoaded: number
  totalFonts: number
}) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredFonts = fonts.filter(
    (font) =>
      font &&
      font.family &&
      typeof font.family === "string" &&
      font.family.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery("")
    }
  }, [open])

  return (
    <Select value={value} onValueChange={onValueChange} open={open} onOpenChange={setOpen}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select font" />
      </SelectTrigger>
      <SelectContent className="p-0">
        <div className="sticky top-0 z-10 bg-background p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search fonts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <p>Loading fonts...</p>
            </div>
          ) : filteredFonts.length === 0 ? (
            <div className="p-2 text-center text-muted-foreground">No fonts found</div>
          ) : (
            <>
              {filteredFonts.map((font) => (
                <SelectItem key={font.family} value={font.family} className="py-3">
                  {font.family}
                </SelectItem>
              ))}
              {hasMoreFonts && (
                <div className="p-2 border-t mt-2">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault()
                      onLoadMore()
                    }}
                    disabled={isLoadingMore || !hasMoreFonts}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading more fonts...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Load More ({totalLoaded}/{totalFonts})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  )
}

function FontWeightSelect({
  value,
  onValueChange,
  availableWeights,
  id,
}: {
  value: string
  onValueChange: (value: string) => void
  availableWeights: string[]
  id: string
}) {
  const filteredWeights = FONT_WEIGHTS.filter((weight) => availableWeights.includes(weight.value))

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select weight" />
      </SelectTrigger>
      <SelectContent>
        {filteredWeights.length > 0 ? (
          filteredWeights.map((weight) => (
            <SelectItem key={weight.value} value={weight.value}>
              {weight.label}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="400">Regular (400)</SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}

export default function FontPairingGenerator() {
  const [fonts, setFonts] = useState<any[]>([])
  const [filteredFonts, setFilteredFonts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("sans serif")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreFonts, setHasMoreFonts] = useState(true)
  const [totalFonts, setTotalFonts] = useState(0)
  const [totalLoaded, setTotalLoaded] = useState(0)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  const [headingFont, setHeadingFont] = useState("Playfair Display")
  const [paragraphFont, setParagraphFont] = useState("Source Sans Pro")

  const [headingSettings, setHeadingSettings] = useState({
    fontSize: { value: 36, unit: "px" },
    lineHeight: 1.2,
    letterSpacing: { value: 0, unit: "px" },
    wordSpacing: { value: 0, unit: "px" },
    fontWeight: "700",
    textStyle: [] as string[], 
  })

  const [paragraphSettings, setParagraphSettings] = useState({
    fontSize: { value: 16, unit: "px" },
    lineHeight: 1.6,
    letterSpacing: { value: 0, unit: "px" },
    wordSpacing: { value: 0, unit: "px" },
    fontWeight: "400",
    textStyle: [] as string[], 
  })

  const [headingAvailableWeights, setHeadingAvailableWeights] = useState<string[]>(["400", "700"])
  const [paragraphAvailableWeights, setParagraphAvailableWeights] = useState<string[]>(["400", "700"])

  const [headingHasItalic, setHeadingHasItalic] = useState(true)
  const [paragraphHasItalic, setParagraphHasItalic] = useState(true)

  const [headingContent, setHeadingContent] = useState(DEFAULT_HEADING)
  const [paragraphContent, setParagraphContent] = useState(DEFAULT_PARAGRAPH)

  const [copied, setCopied] = useState(false)

  const loadFontsFromAPI = async (page = 0) => {
    try {
      setIsLoadingMore(true)
      const result = await fetchGoogleFontsBatch(page, 20, selectedCategory)

      if (result.fonts.length > 0) {
        const processedFonts = result.fonts.map((font: any) => ({
          family: font.family,
          category: font.category,
          variants: font.variants || ["regular", "700"],
        }))

        if (page === 0) {
          setFonts(processedFonts)
          setFilteredFonts(processedFonts)
        } else {
          setFonts((prevFonts) => [...prevFonts, ...processedFonts])
          setFilteredFonts((prevFonts) => [...prevFonts, ...processedFonts])
        }

        setCurrentPage(page)
        setHasMoreFonts(result.hasMore)
        setTotalFonts(result.totalFonts)
        setTotalLoaded(result.totalLoaded)

        console.log(`Loaded ${processedFonts.length} fonts. Total: ${result.totalLoaded}/${result.totalFonts}`)
      } else {
        setHasMoreFonts(false)
      }
    } catch (error) {
      console.error("Error loading fonts from API:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreFonts) return
    await loadFontsFromAPI(currentPage + 1)
  }

  useEffect(() => {
    if (initialLoadComplete) {
      setCurrentPage(0)
      setHasMoreFonts(true)
      loadFontsFromAPI(0)
    }
  }, [selectedCategory, initialLoadComplete])

  useEffect(() => {
    const initializeFonts = async () => {
      setIsLoading(true)

      try {
        await loadFontsFromAPI(0)

        if (fonts.length > 0) {
          setHeadingAvailableWeights(getAvailableWeights(headingFont, fonts))
          setParagraphAvailableWeights(getAvailableWeights(paragraphFont, fonts))

          setHeadingHasItalic(hasItalicVariant(headingFont, fonts))
          setParagraphHasItalic(hasItalicVariant(paragraphFont, fonts))
        }

        setInitialLoadComplete(true)
      } catch (error) {
        console.error("Error initializing fonts:", error)

        const fallbackFonts = [
          {
            family: "Roboto",
            category: "Sans Serif",
            variants: ["400", "700", "400italic", "700italic"],
          },
          {
            family: "Playfair Display",
            category: "Serif",
            variants: ["400", "700", "400italic", "700italic"],
          },
          {
            family: "Source Sans Pro",
            category: "Sans Serif",
            variants: ["400", "700", "400italic", "700italic"],
          },
        ]
        setFonts(fallbackFonts)
        setFilteredFonts(fallbackFonts.filter((font) => font.category === "Sans Serif"))
        setTotalLoaded(fallbackFonts.length)
        setTotalFonts(fallbackFonts.length)
      } finally {
        setIsLoading(false)
      }
    }

    initializeFonts()
  }, [])

  useEffect(() => {
    if (fonts.length > 0) {
      setHeadingAvailableWeights(getAvailableWeights(headingFont, fonts))
      setHeadingHasItalic(hasItalicVariant(headingFont, fonts))

      if (!getAvailableWeights(headingFont, fonts).includes(headingSettings.fontWeight)) {
        const availableWeights = getAvailableWeights(headingFont, fonts)
        setHeadingSettings({
          ...headingSettings,
          fontWeight: availableWeights.includes("700") ? "700" : availableWeights[0] || "400",
        })
      }

      if (headingSettings.textStyle.includes("italic") && !hasItalicVariant(headingFont, fonts)) {
        setHeadingSettings({
          ...headingSettings,
          textStyle: headingSettings.textStyle.filter((style) => style !== "italic"),
        })
      }
    }
  }, [headingFont, fonts, headingSettings])

  useEffect(() => {
    if (fonts.length > 0) {
      setParagraphAvailableWeights(getAvailableWeights(paragraphFont, fonts))
      setParagraphHasItalic(hasItalicVariant(paragraphFont, fonts))

      if (!getAvailableWeights(paragraphFont, fonts).includes(paragraphSettings.fontWeight)) {
        const availableWeights = getAvailableWeights(paragraphFont, fonts)
        setParagraphSettings({
          ...paragraphSettings,
          fontWeight: availableWeights.includes("400") ? "400" : availableWeights[0] || "400",
        })
      }

      if (paragraphSettings.textStyle.includes("italic") && !hasItalicVariant(paragraphFont, fonts)) {
        setParagraphSettings({
          ...paragraphSettings,
          textStyle: paragraphSettings.textStyle.filter((style) => style !== "italic"),
        })
      }
    }
  }, [paragraphFont, fonts, paragraphSettings])

  useEffect(() => {
    if (headingFont && paragraphFont && fonts.length > 0) {
      const isHeadingItalic = headingSettings.textStyle.includes("italic")
      const isParagraphItalic = paragraphSettings.textStyle.includes("italic")

      let headingWeight = headingSettings.fontWeight
      if (!FontLoader.isWeightAvailable(headingFont, headingWeight, fonts)) {
        const availableWeights = getAvailableWeights(headingFont, fonts)
        headingWeight = availableWeights.includes("400") ? "400" : availableWeights[0] || "400"

        if (headingWeight !== headingSettings.fontWeight) {
          setHeadingSettings({
            ...headingSettings,
            fontWeight: headingWeight,
          })
        }
      }

      let paragraphWeight = paragraphSettings.fontWeight
      if (!FontLoader.isWeightAvailable(paragraphFont, paragraphWeight, fonts)) {
        const availableWeights = getAvailableWeights(paragraphFont, fonts)
        paragraphWeight = availableWeights.includes("400") ? "400" : availableWeights[0] || "400"

        if (paragraphWeight !== paragraphSettings.fontWeight) {
          setParagraphSettings({
            ...paragraphSettings,
            fontWeight: paragraphWeight,
          })
        }
      }

      FontLoader.loadFontConfigs([
        { family: headingFont, weight: headingWeight, isItalic: isHeadingItalic },
        { family: paragraphFont, weight: paragraphWeight, isItalic: isParagraphItalic },
      ])
    }
  }, [
    headingFont,
    paragraphFont,
    headingSettings.fontWeight,
    paragraphSettings.fontWeight,
    headingSettings.textStyle,
    paragraphSettings.textStyle,
    fonts,
  ])
  const handleHeadingTextStyleToggle = (value: string[]) => {
    if (value.includes("italic") && !headingHasItalic && !headingSettings.textStyle.includes("italic")) {
      return
    }

    setHeadingSettings({
      ...headingSettings,
      textStyle: value,
    })
  }

  const handleParagraphTextStyleToggle = (value: string[]) => {
    if (value.includes("italic") && !paragraphHasItalic && !paragraphSettings.textStyle.includes("italic")) {
      return
    }

    setParagraphSettings({
      ...paragraphSettings,
      textStyle: value,
    })
  }

  const handleHeadingUnitChange = (property: string, unit: string) => {
    if (property === "fontSize") {
      setHeadingSettings({
        ...headingSettings,
        fontSize: {
          value: convertValueBetweenUnits(headingSettings.fontSize.value, headingSettings.fontSize.unit, unit),
          unit,
        },
      })
    } else if (property === "letterSpacing") {
      setHeadingSettings({
        ...headingSettings,
        letterSpacing: {
          value: convertValueBetweenUnits(
            headingSettings.letterSpacing.value,
            headingSettings.letterSpacing.unit,
            unit,
          ),
          unit,
        },
      })
    } else if (property === "wordSpacing") {
      setHeadingSettings({
        ...headingSettings,
        wordSpacing: {
          value: convertValueBetweenUnits(headingSettings.wordSpacing.value, headingSettings.wordSpacing.unit, unit),
          unit,
        },
      })
    }
  }

  const handleParagraphUnitChange = (property: string, unit: string) => {
    if (property === "fontSize") {
      setParagraphSettings({
        ...paragraphSettings,
        fontSize: {
          value: convertValueBetweenUnits(paragraphSettings.fontSize.value, paragraphSettings.fontSize.unit, unit),
          unit,
        },
      })
    } else if (property === "letterSpacing") {
      setParagraphSettings({
        ...paragraphSettings,
        letterSpacing: {
          value: convertValueBetweenUnits(
            paragraphSettings.letterSpacing.value,
            paragraphSettings.letterSpacing.unit,
            unit,
          ),
          unit,
        },
      })
    } else if (property === "wordSpacing") {
      setParagraphSettings({
        ...paragraphSettings,
        wordSpacing: {
          value: convertValueBetweenUnits(
            paragraphSettings.wordSpacing.value,
            paragraphSettings.wordSpacing.unit,
            unit,
          ),
          unit,
        },
      })
    }
  }

  const convertValueBetweenUnits = (value: number, fromUnit: string, toUnit: string): number => {
    if (fromUnit === toUnit) return value

    const pxEquivalents: Record<string, number> = {
      px: 1,
      rem: 16,
      em: 16,
      "%": 0.16,
      vh: 7.2,
      vw: 12.8,
      ch: 8,
    }

    const pxValue = value * pxEquivalents[fromUnit]

    return Number.parseFloat((pxValue / pxEquivalents[toUnit]).toFixed(4))
  }

  const getTextDecoration = (textStyle: string[]): string => {
    const decorations = []
    if (textStyle.includes("underline")) decorations.push("underline")
    if (textStyle.includes("line-through")) decorations.push("line-through")
    return decorations.length > 0 ? decorations.join(" ") : "none"
  }

  const getFontStyle = (textStyle: string[]): string => {
    return textStyle.includes("italic") ? "italic" : "normal"
  }

  const generateCSS = () => {
    const headingImport = headingSettings.textStyle.includes("italic")
      ? `${headingFont.replace(/ /g, "+")}:ital,wght@1,${headingSettings.fontWeight}`
      : `${headingFont.replace(/ /g, "+")}:wght@${headingSettings.fontWeight}`

    const paragraphImport = paragraphSettings.textStyle.includes("italic")
      ? `${paragraphFont.replace(/ /g, "+")}:ital,wght@1,${paragraphSettings.fontWeight}`
      : `${paragraphFont.replace(/ /g, "+")}:wght@${paragraphSettings.fontWeight}`

    return `/* Font Import */
@import url('https://fonts.googleapis.com/css2?family=${headingImport}&family=${paragraphImport}&display=swap');

/* Heading Styles */
h1, h2, h3, h4, h5, h6 {
  font-family: '${headingFont}', sans-serif;
  font-size: ${headingSettings.fontSize.value}${headingSettings.fontSize.unit};
  line-height: ${headingSettings.lineHeight};
  letter-spacing: ${headingSettings.letterSpacing.value}${headingSettings.letterSpacing.unit};
  word-spacing: ${headingSettings.wordSpacing.value}${headingSettings.wordSpacing.unit};
  font-weight: ${headingSettings.fontWeight};
  font-style: ${getFontStyle(headingSettings.textStyle)};
  text-decoration: ${getTextDecoration(headingSettings.textStyle)};
}

/* Paragraph Styles */
p, li, blockquote {
  font-family: '${paragraphFont}', sans-serif;
  font-size: ${paragraphSettings.fontSize.value}${paragraphSettings.fontSize.unit};
  line-height: ${paragraphSettings.lineHeight};
  letter-spacing: ${paragraphSettings.letterSpacing.value}${paragraphSettings.letterSpacing.unit};
  word-spacing: ${paragraphSettings.wordSpacing.value}${paragraphSettings.wordSpacing.unit};
  font-weight: ${paragraphSettings.fontWeight};
  font-style: ${getFontStyle(paragraphSettings.textStyle)};
  text-decoration: ${getTextDecoration(paragraphSettings.textStyle)};
}`
  }

  const handleCopyCSS = () => {
    navigator.clipboard.writeText(generateCSS())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getRange = (property: string, unit: string) => {
    if (property === "lineHeight") {
      return LINE_HEIGHT_RANGE
    }
    return UNIT_RANGES[unit][property as keyof (typeof UNIT_RANGES)[typeof unit]]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
      {/* Left Column - Controls */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Font Selection</h2>

          <div className="mb-6">
            <Label htmlFor="category-filter" className="mb-2 block">
              Filter by Category
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {FONT_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="heading" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="heading">Heading Font</TabsTrigger>
              <TabsTrigger value="paragraph">Paragraph Font</TabsTrigger>
            </TabsList>

            <TabsContent value="heading" className="space-y-4">
              <div>
                <Label htmlFor="heading-font" className="mb-2 block">
                  Select Heading Font
                </Label>
                <FontSelect
                  id="heading-font"
                  value={headingFont}
                  onValueChange={setHeadingFont}
                  fonts={filteredFonts}
                  isLoading={isLoading}
                  onLoadMore={handleLoadMore}
                  isLoadingMore={isLoadingMore}
                  hasMoreFonts={hasMoreFonts}
                  totalLoaded={totalLoaded}
                  totalFonts={totalFonts}
                />
              </div>

              <div>
                <Label htmlFor="heading-font-weight" className="mb-2 block">
                  Font Weight
                </Label>
                <FontWeightSelect
                  id="heading-font-weight"
                  value={headingSettings.fontWeight}
                  onValueChange={(value) => setHeadingSettings({ ...headingSettings, fontWeight: value })}
                  availableWeights={headingAvailableWeights}
                />
              </div>

              <div>
                <Label className="mb-2 block">Text Style</Label>
                <ToggleGroup
                  type="multiple"
                  value={headingSettings.textStyle}
                  onValueChange={handleHeadingTextStyleToggle}
                  className="justify-start"
                >
                  <ToggleGroupItem
                    value="italic"
                    aria-label="Toggle italic"
                    disabled={!headingHasItalic}
                    title={!headingHasItalic ? "Italic not available for this font" : "Toggle italic"}
                  >
                    <Italic className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="underline" aria-label="Toggle underline">
                    <Underline className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="line-through" aria-label="Toggle strikethrough">
                    <StrikethroughIcon className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-4">
                {/* Font Size with Unit Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="heading-font-size">
                      Font Size: {headingSettings.fontSize.value}
                      {headingSettings.fontSize.unit}
                    </Label>
                    <Select
                      value={headingSettings.fontSize.unit}
                      onValueChange={(unit) => handleHeadingUnitChange("fontSize", unit)}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {CSS_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Slider
                    id="heading-font-size"
                    min={getRange("fontSize", headingSettings.fontSize.unit).min}
                    max={getRange("fontSize", headingSettings.fontSize.unit).max}
                    step={getRange("fontSize", headingSettings.fontSize.unit).step}
                    value={[headingSettings.fontSize.value]}
                    onValueChange={(value) =>
                      setHeadingSettings({
                        ...headingSettings,
                        fontSize: { ...headingSettings.fontSize, value: value[0] },
                      })
                    }
                  />
                </div>

                {/* Line Height */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="heading-line-height">Line Height: {headingSettings.lineHeight}</Label>
                  </div>
                  <Slider
                    id="heading-line-height"
                    min={LINE_HEIGHT_RANGE.min}
                    max={LINE_HEIGHT_RANGE.max}
                    step={LINE_HEIGHT_RANGE.step}
                    value={[headingSettings.lineHeight]}
                    onValueChange={(value) => setHeadingSettings({ ...headingSettings, lineHeight: value[0] })}
                  />
                </div>

                {/* Letter Spacing with Unit Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="heading-letter-spacing">
                      Letter Spacing: {headingSettings.letterSpacing.value}
                      {headingSettings.letterSpacing.unit}
                    </Label>
                    <Select
                      value={headingSettings.letterSpacing.unit}
                      onValueChange={(unit) => handleHeadingUnitChange("letterSpacing", unit)}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {CSS_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Slider
                    id="heading-letter-spacing"
                    min={getRange("letterSpacing", headingSettings.letterSpacing.unit).min}
                    max={getRange("letterSpacing", headingSettings.letterSpacing.unit).max}
                    step={getRange("letterSpacing", headingSettings.letterSpacing.unit).step}
                    value={[headingSettings.letterSpacing.value]}
                    onValueChange={(value) =>
                      setHeadingSettings({
                        ...headingSettings,
                        letterSpacing: { ...headingSettings.letterSpacing, value: value[0] },
                      })
                    }
                  />
                </div>

                {/* Word Spacing with Unit Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="heading-word-spacing">
                      Word Spacing: {headingSettings.wordSpacing.value}
                      {headingSettings.wordSpacing.unit}
                    </Label>
                    <Select
                      value={headingSettings.wordSpacing.unit}
                      onValueChange={(unit) => handleHeadingUnitChange("wordSpacing", unit)}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {CSS_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Slider
                    id="heading-word-spacing"
                    min={getRange("wordSpacing", headingSettings.wordSpacing.unit).min}
                    max={getRange("wordSpacing", headingSettings.wordSpacing.unit).max}
                    step={getRange("wordSpacing", headingSettings.wordSpacing.unit).step}
                    value={[headingSettings.wordSpacing.value]}
                    onValueChange={(value) =>
                      setHeadingSettings({
                        ...headingSettings,
                        wordSpacing: { ...headingSettings.wordSpacing, value: value[0] },
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="paragraph" className="space-y-4">
              <div>
                <Label htmlFor="paragraph-font" className="mb-2 block">
                  Select Paragraph Font
                </Label>
                <FontSelect
                  id="paragraph-font"
                  value={paragraphFont}
                  onValueChange={setParagraphFont}
                  fonts={filteredFonts}
                  isLoading={isLoading}
                  onLoadMore={handleLoadMore}
                  isLoadingMore={isLoadingMore}
                  hasMoreFonts={hasMoreFonts}
                  totalLoaded={totalLoaded}
                  totalFonts={totalFonts}
                />
              </div>

              <div>
                <Label htmlFor="paragraph-font-weight" className="mb-2 block">
                  Font Weight
                </Label>
                <FontWeightSelect
                  id="paragraph-font-weight"
                  value={paragraphSettings.fontWeight}
                  onValueChange={(value) => setParagraphSettings({ ...paragraphSettings, fontWeight: value })}
                  availableWeights={paragraphAvailableWeights}
                />
              </div>

              <div>
                <Label className="mb-2 block">Text Style</Label>
                <ToggleGroup
                  type="multiple"
                  value={paragraphSettings.textStyle}
                  onValueChange={handleParagraphTextStyleToggle}
                  className="justify-start"
                >
                  <ToggleGroupItem
                    value="italic"
                    aria-label="Toggle italic"
                    disabled={!paragraphHasItalic}
                    title={!paragraphHasItalic ? "Italic not available for this font" : "Toggle italic"}
                  >
                    <Italic className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="underline" aria-label="Toggle underline">
                    <Underline className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="line-through" aria-label="Toggle strikethrough">
                    <StrikethroughIcon className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-4">
                {/* Font Size with Unit Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="paragraph-font-size">
                      Font Size: {paragraphSettings.fontSize.value}
                      {paragraphSettings.fontSize.unit}
                    </Label>
                    <Select
                      value={paragraphSettings.fontSize.unit}
                      onValueChange={(unit) => handleParagraphUnitChange("fontSize", unit)}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {CSS_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Slider
                    id="paragraph-font-size"
                    min={getRange("fontSize", paragraphSettings.fontSize.unit).min}
                    max={getRange("fontSize", paragraphSettings.fontSize.unit).max}
                    step={getRange("fontSize", paragraphSettings.fontSize.unit).step}
                    value={[paragraphSettings.fontSize.value]}
                    onValueChange={(value) =>
                      setParagraphSettings({
                        ...paragraphSettings,
                        fontSize: { ...paragraphSettings.fontSize, value: value[0] },
                      })
                    }
                  />
                </div>

                {/* Line Height */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="paragraph-line-height">Line Height: {paragraphSettings.lineHeight}</Label>
                  </div>
                  <Slider
                    id="paragraph-line-height"
                    min={LINE_HEIGHT_RANGE.min}
                    max={LINE_HEIGHT_RANGE.max}
                    step={LINE_HEIGHT_RANGE.step}
                    value={[paragraphSettings.lineHeight]}
                    onValueChange={(value) => setParagraphSettings({ ...paragraphSettings, lineHeight: value[0] })}
                  />
                </div>

                {/* Letter Spacing with Unit Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="paragraph-letter-spacing">
                      Letter Spacing: {paragraphSettings.letterSpacing.value}
                      {paragraphSettings.letterSpacing.unit}
                    </Label>
                    <Select
                      value={paragraphSettings.letterSpacing.unit}
                      onValueChange={(unit) => handleParagraphUnitChange("letterSpacing", unit)}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {CSS_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Slider
                    id="paragraph-letter-spacing"
                    min={getRange("letterSpacing", paragraphSettings.letterSpacing.unit).min}
                    max={getRange("letterSpacing", paragraphSettings.letterSpacing.unit).max}
                    step={getRange("letterSpacing", paragraphSettings.letterSpacing.unit).step}
                    value={[paragraphSettings.letterSpacing.value]}
                    onValueChange={(value) =>
                      setParagraphSettings({
                        ...paragraphSettings,
                        letterSpacing: { ...paragraphSettings.letterSpacing, value: value[0] },
                      })
                    }
                  />
                </div>

                {/* Word Spacing with Unit Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="paragraph-word-spacing">
                      Word Spacing: {paragraphSettings.wordSpacing.value}
                      {paragraphSettings.wordSpacing.unit}
                    </Label>
                    <Select
                      value={paragraphSettings.wordSpacing.unit}
                      onValueChange={(unit) => handleParagraphUnitChange("wordSpacing", unit)}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {CSS_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Slider
                    id="paragraph-word-spacing"
                    min={getRange("wordSpacing", paragraphSettings.wordSpacing.unit).min}
                    max={getRange("wordSpacing", paragraphSettings.wordSpacing.unit).max}
                    step={getRange("wordSpacing", paragraphSettings.wordSpacing.unit).step}
                    value={[paragraphSettings.wordSpacing.value]}
                    onValueChange={(value) =>
                      setParagraphSettings({
                        ...paragraphSettings,
                        wordSpacing: { ...paragraphSettings.wordSpacing, value: value[0] },
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Generated CSS</h2>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
            <code>{generateCSS()}</code>
          </pre>
          <Button onClick={handleCopyCSS} className="mt-4 w-full">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Clipboard className="mr-2 h-4 w-4" />
                Copy CSS
              </>
            )}
          </Button>
        </Card>
      </div>

      {/* Right Column - Preview */}
      <Card className="p-6 lg:p-10">
        <h2 className="text-2xl font-bold mb-4">Font Preview</h2>
        <div className="prose prose-stone max-w-none">
          <ContentEditable
            html={headingContent}
            onChange={setHeadingContent}
            style={{
              fontFamily: `'${headingFont}', sans-serif`,
              fontSize: `${headingSettings.fontSize.value}${headingSettings.fontSize.unit}`,
              lineHeight: headingSettings.lineHeight,
              letterSpacing: `${headingSettings.letterSpacing.value}${headingSettings.letterSpacing.unit}`,
              wordSpacing: `${headingSettings.wordSpacing.value}${headingSettings.wordSpacing.unit}`,
              fontWeight: headingSettings.fontWeight,
              fontStyle: getFontStyle(headingSettings.textStyle),
              textDecoration: getTextDecoration(headingSettings.textStyle),
            }}
          />

          <ContentEditable
            html={paragraphContent}
            onChange={setParagraphContent}
            style={{
              fontFamily: `'${paragraphFont}', sans-serif`,
              fontSize: `${paragraphSettings.fontSize.value}${paragraphSettings.fontSize.unit}`,
              lineHeight: paragraphSettings.lineHeight,
              letterSpacing: `${paragraphSettings.letterSpacing.value}${paragraphSettings.letterSpacing.unit}`,
              wordSpacing: `${paragraphSettings.wordSpacing.value}${paragraphSettings.wordSpacing.unit}`,
              fontWeight: paragraphSettings.fontWeight,
              fontStyle: getFontStyle(paragraphSettings.textStyle),
              textDecoration: getTextDecoration(paragraphSettings.textStyle),
            }}
          />
        </div>
      </Card>
    </div>
  )
}

