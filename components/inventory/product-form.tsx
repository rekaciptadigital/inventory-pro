{/* Previous imports remain the same */}

export function ProductForm() {
  const [useCustomMultipliers, setUseCustomMultipliers] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const { categories } = usePriceCategories();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: '',
      sku: '',
      productName: '',
      unit: 'Pcs',
      usdPrice: 0,
      exchangeRate: 0,
      adjustmentPercentage: 0,
      multipliers: Object.fromEntries(
        categories.map(cat => [cat.name.toLowerCase(), cat.multiplier])
      ),
      quantities: {
        min15: 0,
        min10: 0,
        min5: 0,
        single: 0,
        retail: 0,
      },
      customerCategories: Object.fromEntries(
        categories.map(cat => [cat.name.toLowerCase(), 0])
      ),
    },
  });

  // Rest of the component remains the same, but update the numeric input fields to handle empty values:

  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: {
      onChange: (value: number) => void;
      onBlur: () => void;
    }
  ) => {
    const value = e.target.value;
    const numberValue = value === '' ? 0 : parseFloat(value);
    field.onChange(numberValue);
    setIsCalculating(true);
  };

  // Update the numeric input fields in the form:
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Other fields remain the same */}

        <FormField
          control={form.control}
          name="usdPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>USD Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter USD price"
                  value={field.value || ''}
                  onChange={(e) => handleNumericChange(e, field)}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exchangeRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exchange Rate</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter exchange rate"
                  value={field.value || ''}
                  onChange={(e) => handleNumericChange(e, field)}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adjustmentPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adjustment Percentage</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter adjustment percentage"
                  value={field.value || ''}
                  onChange={(e) => handleNumericChange(e, field)}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Update multiplier inputs */}
        {useCustomMultipliers && categories.map((category) => (
          <FormField
            key={category.id}
            control={form.control}
            name={`multipliers.${category.name.toLowerCase()}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{category.name} Multiplier</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={category.multiplier.toString()}
                    value={field.value || ''}
                    onChange={(e) => handleNumericChange(e, field)}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {/* Rest of the form remains the same */}
      </form>
    </Form>
  );
}