import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AnalysisFormProps {
  jewelryType: string;
  estimatedEra: string;
  additionalInfo: string;
  onJewelryTypeChange: (value: string) => void;
  onEstimatedEraChange: (value: string) => void;
  onAdditionalInfoChange: (value: string) => void;
}

export default function AnalysisForm({
  jewelryType,
  estimatedEra,
  additionalInfo,
  onJewelryTypeChange,
  onEstimatedEraChange,
  onAdditionalInfoChange
}: AnalysisFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="jewelryType" className="text-sm font-medium text-charcoal">
          Jewelry Type *
        </Label>
        <Select value={jewelryType} onValueChange={onJewelryTypeChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ring">Ring</SelectItem>
            <SelectItem value="necklace">Necklace</SelectItem>
            <SelectItem value="earrings">Earrings</SelectItem>
            <SelectItem value="bracelet">Bracelet</SelectItem>
            <SelectItem value="watch">Watch</SelectItem>
            <SelectItem value="brooch">Brooch</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="estimatedEra" className="text-sm font-medium text-charcoal">
          Estimated Era (Optional)
        </Label>
        <Select value={estimatedEra} onValueChange={onEstimatedEraChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Unknown" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unknown">Unknown</SelectItem>
            <SelectItem value="victorian">Victorian (1837-1901)</SelectItem>
            <SelectItem value="edwardian">Edwardian (1901-1915)</SelectItem>
            <SelectItem value="artdeco">Art Deco (1920s-1930s)</SelectItem>
            <SelectItem value="midcentury">Mid-Century (1940s-1960s)</SelectItem>
            <SelectItem value="modern">Modern (1970s+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="additionalInfo" className="text-sm font-medium text-charcoal">
          Additional Information (Optional)
        </Label>
        <Textarea
          id="additionalInfo"
          value={additionalInfo}
          onChange={(e) => onAdditionalInfoChange(e.target.value)}
          placeholder="Any known history, brand markings, or special features..."
          className="mt-1"
          rows={3}
        />
      </div>
    </div>
  );
}