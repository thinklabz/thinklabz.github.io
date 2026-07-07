import { CardCustomization } from '../../types/frames'

interface CardTypeSelectorProps {
  customization: CardCustomization
  onCustomizationChange: (customization: CardCustomization) => void
}

export default function CardTypeSelector({
  customization,
  onCustomizationChange
}: CardTypeSelectorProps) {

  return (
    <div className="p-5 space-y-6">
      {/* Font */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Font</label>
        <select
          value={customization.font}
          onChange={(e) => onCustomizationChange({ ...customization, font: e.target.value })}
          className="w-full px-4 py-3 bg-secondary/20 border border-border/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 text-foreground text-sm transition-all cursor-pointer hover:bg-secondary/30"
          style={{ minHeight: '48px' }}
        >
          <option value="'Playfair Display', serif" className="text-foreground bg-background">Playfair Display</option>
          <option value="'Georgia', serif" className="text-foreground bg-background">Georgia</option>
          <option value="'Times New Roman', serif" className="text-foreground bg-background">Times New Roman</option>
          <option value="'Arial', sans-serif" className="text-foreground bg-background">Arial</option>
          <option value="'Helvetica', sans-serif" className="text-foreground bg-background">Helvetica</option>
          <option value="'Verdana', sans-serif" className="text-foreground bg-background">Verdana</option>
        </select>
      </div>

      {/* Font Size */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Font Size: {customization.fontSize}px</label>
        <input
          type="range"
          min="16"
          max="64"
          value={customization.fontSize}
          onChange={(e) => onCustomizationChange({ ...customization, fontSize: parseInt(e.target.value) })}
          className="w-full h-2 bg-secondary/20 rounded-full appearance-none cursor-pointer accent-primary transition-all hover:bg-secondary/30"
        />
      </div>

      {/* Letter Spacing */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Letter Spacing: {customization.letterSpacing}em</label>
        <input
          type="range"
          min="-0.05"
          max="0.2"
          step="0.01"
          value={customization.letterSpacing}
          onChange={(e) => onCustomizationChange({ ...customization, letterSpacing: parseFloat(e.target.value) })}
          className="w-full h-2 bg-secondary/20 rounded-full appearance-none cursor-pointer accent-primary transition-all hover:bg-secondary/30"
        />
      </div>

      {/* Line Height */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Line Height: {customization.lineHeight}</label>
        <input
          type="range"
          min="1"
          max="2"
          step="0.1"
          value={customization.lineHeight}
          onChange={(e) => onCustomizationChange({ ...customization, lineHeight: parseFloat(e.target.value) })}
          className="w-full h-2 bg-secondary/20 rounded-full appearance-none cursor-pointer accent-primary transition-all hover:bg-secondary/30"
        />
      </div>

      {/* User Name */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User Name</label>
        <input
          type="text"
          value={customization.userName || ''}
          onChange={(e) => onCustomizationChange({ ...customization, userName: e.target.value })}
          placeholder="ZeroDot"
          className="w-full px-4 py-3 bg-secondary/20 border border-border/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 text-foreground text-base font-medium transition-all placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Background Blur */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Background Blur: {customization.backgroundBlur}px</label>
        <input
          type="range"
          min="0"
          max="20"
          value={customization.backgroundBlur}
          onChange={(e) => onCustomizationChange({ ...customization, backgroundBlur: parseInt(e.target.value) })}
          className="w-full h-2 bg-secondary/20 rounded-full appearance-none cursor-pointer accent-primary transition-all hover:bg-secondary/30"
        />
      </div>

      {/* Footer Visibility */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Footer Visibility</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={customization.showUserName}
              onChange={(e) => onCustomizationChange({ ...customization, showUserName: e.target.checked })}
              className="w-4 h-4 rounded border-border/30 bg-secondary/20 text-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-0 accent-primary cursor-pointer"
            />
            <span className="text-sm text-foreground group-hover:text-primary transition-colors">Show User Name</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={customization.showBrand}
              onChange={(e) => onCustomizationChange({ ...customization, showBrand: e.target.checked })}
              className="w-4 h-4 rounded border-border/30 bg-secondary/20 text-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-0 accent-primary cursor-pointer"
            />
            <span className="text-sm text-foreground group-hover:text-primary transition-colors">Show Brand (zerodot.in)</span>
          </label>
        </div>
      </div>
    </div>
  )
}
