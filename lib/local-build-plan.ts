export type LocalSupply = {
  item: string
  quantity: string
  estimatedUnitCost: number
  estimatedLineCost: number
}

export type LocalBuildPlanDraft = {
  title: string
  overview: string
  steps: string[]
  supplies: LocalSupply[]
  materialCost: number
  laborTasks: string[]
  estimatedLaborHours: number
  laborCost: number
  estimatedTotalCost: number
  assumptions: string[]
  safetyAndCodeNotes: string[]
}

function supply(item: string, quantity: string, estimatedUnitCost: number, units = 1): LocalSupply {
  return {
    item,
    quantity,
    estimatedUnitCost,
    estimatedLineCost: Math.round(estimatedUnitCost * units * 100) / 100,
  }
}

export function createLocalBuildPlan(input: {
  project: string
  description: string
  measurements?: string
  laborRate?: number
}): LocalBuildPlanDraft {
  const text = `${input.project} ${input.description} ${input.measurements || ''}`.toLowerCase()
  const supplies: LocalSupply[] = []
  const steps: string[] = [
    'Confirm the full scope with the customer and verify all field dimensions before ordering materials.',
    'Protect adjacent finishes and prepare the work area, access path, tools, and required safety equipment.',
  ]
  const laborTasks = ['Site verification and setup', 'Material handling and installation', 'Cleanup and final walkthrough']

  if (/drywall|sheetrock|mud|mudding/.test(text)) {
    supplies.push(
      supply('1/2 in. drywall sheets', 'Verify wall/ceiling area; include ~10% waste', 16, 10),
      supply('Drywall screws', '1 box', 28),
      supply('Joint tape', '1 roll', 8),
      supply('Joint compound', '2 buckets', 24, 2),
      supply('Primer', '2 gallons', 32, 2),
    )
    steps.push('Remove or repair damaged board as required, install drywall, fasten to framing, tape seams, apply joint compound in coats, sand, and prime.')
    laborTasks.push('Drywall hanging', 'Taping/mudding/sanding')
  }

  if (/paint|painting|primer/.test(text)) {
    supplies.push(
      supply('Interior paint', '2 gallons planning allowance', 42, 2),
      supply('Painter tape / masking materials', '1 set', 18),
      supply('Roller covers / brushes', '1 set', 25),
    )
    steps.push('Patch and prep surfaces, mask adjacent finishes, prime where required, then apply finish coats after proper dry time.')
    laborTasks.push('Surface prep and painting')
  }

  if (/floor|flooring|lvp|vinyl|laminate|hardwood|tile/.test(text)) {
    supplies.push(
      supply('Finish flooring', 'Measured square footage + ~10% waste', 3.5, 100),
      supply('Underlayment / setting material', 'Match measured square footage', 0.8, 100),
      supply('Transitions / trim allowance', 'Planning allowance', 75),
    )
    steps.push('Verify substrate condition and moisture requirements, correct high/low areas, acclimate materials when required, then install flooring and transitions per manufacturer instructions.')
    laborTasks.push('Floor preparation', 'Flooring installation and trim')
  }

  if (/cabinet|cupboard/.test(text)) {
    supplies.push(
      supply('Cabinetry allowance', 'Final cabinet count and layout required', 350, 6),
      supply('Cabinet fasteners / shims', '1 set', 45),
      supply('Hardware allowance', 'Final count required', 120),
    )
    steps.push('Confirm cabinet layout and appliance clearances, locate framing, establish level reference lines, install and fasten cabinets, then adjust doors/drawers and hardware.')
    laborTasks.push('Cabinet layout and installation')
  }

  if (/deck|porch/.test(text)) {
    supplies.push(
      supply('Pressure-treated framing lumber', 'Final takeoff required', 450),
      supply('Deck boards', 'Final square footage + waste required', 650),
      supply('Exterior structural fasteners/connectors', 'Planning allowance', 180),
      supply('Concrete / footing materials', 'Per approved footing layout', 150),
    )
    steps.push('Confirm setbacks, footing requirements and utility locations; lay out footings, install structure, verify level/square, install decking, guards and stairs as applicable.')
    laborTasks.push('Layout and footings', 'Deck framing', 'Decking / guard installation')
  }

  if (/kitchen|remodel|renovation|demo|demolition/.test(text)) {
    supplies.push(
      supply('Demolition / disposal allowance', '1 project allowance', 250),
      supply('General construction fasteners and consumables', '1 project allowance', 125),
      supply('Protection / cleanup materials', '1 set', 60),
    )
    steps.push('Sequence demolition carefully, verify concealed plumbing/electrical/structural conditions, complete rough work before closing walls, then install finishes in trade order.')
    laborTasks.push('Selective demolition', 'Rough repair / coordination', 'Finish installation')
  }

  if (supplies.length === 0) {
    supplies.push(
      supply('Primary project materials', 'Final field takeoff required', 500),
      supply('Fasteners / adhesives / consumables', 'Planning allowance', 125),
      supply('Protection / cleanup materials', '1 set', 60),
    )
    steps.push('Complete the work in trade sequence from layout and rough preparation through installation, finishing, cleanup, and owner walkthrough.')
  }

  steps.push('Inspect completed work, correct punch-list items, clean the site, and review the finished scope with the customer.')

  const materialCost = Math.round(supplies.reduce((total, item) => total + item.estimatedLineCost, 0) * 100) / 100
  const estimatedLaborHours = Math.max(8, Math.round(8 + laborTasks.length * 4))
  const laborRate = Number.isFinite(input.laborRate) && Number(input.laborRate) > 0 ? Number(input.laborRate) : 55
  const laborCost = Math.round(estimatedLaborHours * laborRate * 100) / 100
  const estimatedTotalCost = Math.round((materialCost + laborCost) * 100) / 100

  return {
    title: input.project || 'Build Plan',
    overview: 'Local planning draft created from the project description. Verify quantities, supplier pricing, field conditions, and code requirements before using it for construction or a customer quote.',
    steps,
    supplies,
    materialCost,
    laborTasks,
    estimatedLaborHours,
    laborCost,
    estimatedTotalCost,
    assumptions: [
      input.measurements?.trim() ? `Field notes supplied: ${input.measurements.trim()}` : 'Final dimensions and material takeoff still need field verification.',
      `Labor is calculated using a planning rate of $${laborRate.toFixed(2)}/hour.`,
      'Material prices are rough planning allowances and are not live supplier quotes.',
      'Taxes, permits, specialty subcontractors, delivery, equipment rental, overhead, and profit may not be included unless specifically described.',
    ],
    safetyAndCodeNotes: [
      'Confirm applicable permits, inspections, manufacturer instructions, and local building-code requirements before work begins.',
      'Verify concealed electrical, plumbing, gas, structural, and hazardous-material conditions before demolition or cutting.',
      'Use appropriate PPE and qualified/licensed trades where required.',
    ],
  }
}
