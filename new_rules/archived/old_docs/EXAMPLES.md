# Exemples de Code selon les Standards

Ce document fournit des exemples concrets d'implémentation suivant les standards définis dans ARCHITECTURE.md.

## Frontend

### Store Zustand

```typescript
// store/feature.store.ts
interface FeatureState {
  items: Feature[];
  isLoading: boolean;
  error: Error | null;
  selectedItem: Feature | null;

  // Actions
  fetchItems: () => Promise<void>;
  createItem: (data: CreateFeatureDTO) => Promise<void>;
  updateItem: (id: string, data: UpdateFeatureDTO) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setSelectedItem: (item: Feature | null) => void;
}

export const useFeatureStore = create<FeatureState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  selectedItem: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/v1/features');
      set({ items: response.data, isLoading: false });
    } catch (error) {
      set({ error, isLoading: false });
    }
  },

  createItem: async data => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/v1/features', data);
      set(state => ({
        items: [...state.items, response.data],
        isLoading: false,
      }));
    } catch (error) {
      set({ error, isLoading: false });
    }
  },

  setSelectedItem: item => set({ selectedItem: item }),
}));
```

### Composant React

```typescript
// components/feature-form.tsx
interface FeatureFormProps {
  initialData?: Feature;
  onComplete?: () => void;
}

export function FeatureForm({ initialData, onComplete }: FeatureFormProps) {
  const { createItem, updateItem } = useFeatureStore();
  const { toast } = useToast();

  const form = useForm<FeatureFormValues>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    }
  });

  const onSubmit = async (values: FeatureFormValues) => {
    try {
      if (initialData) {
        await updateItem(initialData.id, values);
      } else {
        await createItem(values);
      }

      toast({
        title: 'Success',
        description: `Feature ${initialData ? 'updated' : 'created'} successfully`,
      });

      if (onComplete) onComplete();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Autres champs */}
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Feature
        </Button>
      </form>
    </Form>
  );
}
```

## Backend

### Controller

```typescript
// api/feature.controller.ts
@Controller('api/v1/features')
@UseGuards(JwtAuthGuard)
export class FeaturesController {
  private readonly logger = new Logger(FeaturesController.name);

  constructor(
    private readonly featuresService: FeaturesService,
    private readonly filesService: FilesService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all features' })
  async findAll(@Request() req): Promise<Feature[]> {
    this.logger.log(`User ${req.user.id} requesting all features`);
    return this.featuresService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create new feature' })
  async create(@Request() req, @Body() createFeatureDto: CreateFeatureDTO): Promise<Feature> {
    this.logger.log(`User ${req.user.id} creating feature`);
    return this.featuresService.create({
      ...createFeatureDto,
      userId: req.user.id,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update feature' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateFeatureDto: UpdateFeatureDTO
  ): Promise<Feature> {
    this.logger.log(`User ${req.user.id} updating feature ${id}`);
    return this.featuresService.update(id, updateFeatureDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feature' })
  async remove(@Request() req, @Param('id') id: string): Promise<void> {
    this.logger.log(`User ${req.user.id} deleting feature ${id}`);
    await this.featuresService.remove(id);
  }
}
```

### Service

```typescript
// api/feature.service.ts
@Injectable()
export class FeaturesService {
  private readonly logger = new Logger(FeaturesService.name);

  constructor(
    @InjectModel(Feature.name) private featureModel: Model<FeatureDocument>,
    private readonly filesService: FilesService
  ) {}

  async findAll(): Promise<Feature[]> {
    this.logger.log('Finding all features');
    return this.featureModel.find().sort({ createdAt: -1 }).exec();
  }

  async create(createFeatureDto: CreateFeatureDTO): Promise<Feature> {
    this.logger.log(`Creating feature: ${JSON.stringify(createFeatureDto)}`);

    try {
      const feature = new this.featureModel(createFeatureDto);
      const savedFeature = await feature.save();

      this.logger.log(`Feature created with ID: ${savedFeature.id}`);
      return savedFeature;
    } catch (error) {
      this.logger.error(`Error creating feature: ${error.message}`);
      throw new InternalServerErrorException('Failed to create feature');
    }
  }

  async update(id: string, updateFeatureDto: UpdateFeatureDTO): Promise<Feature> {
    this.logger.log(`Updating feature ${id}`);

    try {
      const updatedFeature = await this.featureModel
        .findByIdAndUpdate(id, updateFeatureDto, { new: true })
        .exec();

      if (!updatedFeature) {
        throw new NotFoundException('Feature not found');
      }

      return updatedFeature;
    } catch (error) {
      this.logger.error(`Error updating feature: ${error.message}`);
      throw error;
    }
  }
}
```

### Schema

```typescript
// api/schemas/feature.schema.ts
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Feature {
  @Prop({
    required: true,
    index: true,
    trim: true,
    minlength: 2,
  })
  name: string;

  @Prop({
    type: String,
    trim: true,
  })
  description?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: string;

  @Prop({
    type: String,
    default: 'https://default-image.url',
  })
  imageUrl?: string;

  // Timestamps ajoutés automatiquement
  createdAt?: Date;
  updatedAt?: Date;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);

// Indexes
FeatureSchema.index({ name: 1, userId: 1 }, { unique: true });

// Middleware
FeatureSchema.pre('save', function (next) {
  // Logique de pré-sauvegarde
  next();
});

// Virtuals
FeatureSchema.virtual('displayName').get(function () {
  return `${this.name} (${this.id})`;
});
```

Ces exemples illustrent l'application concrète des standards définis dans notre architecture. Ils servent de référence pour l'implémentation de nouveaux modules et le refactoring des modules existants.
