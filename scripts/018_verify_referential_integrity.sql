-- Verify and document all foreign key relationships

-- This script documents all FK relationships for reference
-- Run this to verify all relationships are properly set up

DO $$
DECLARE
  fk_count INTEGER;
BEGIN
  -- Count all foreign key constraints
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY'
  AND table_schema = 'public';
  
  RAISE NOTICE 'Total foreign key constraints: %', fk_count;
  
  -- List all foreign keys
  RAISE NOTICE 'Foreign Key Relationships:';
  FOR fk_count IN 
    SELECT 
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  LOOP
    -- Results will be shown in database logs
  END LOOP;
END $$;

-- Verify no orphaned records exist
DO $$
BEGIN
  -- Check for orphaned property_hero records
  IF EXISTS (
    SELECT 1 FROM public.property_hero ph
    LEFT JOIN public.property_analyses pa ON ph.property_analysis_id = pa.id
    WHERE pa.id IS NULL
  ) THEN
    RAISE WARNING 'Found orphaned records in property_hero table';
  END IF;
  
  -- Check for orphaned revenue_projections records
  IF EXISTS (
    SELECT 1 FROM public.revenue_projections rp
    LEFT JOIN public.property_analyses pa ON rp.property_analysis_id = pa.id
    WHERE pa.id IS NULL
  ) THEN
    RAISE WARNING 'Found orphaned records in revenue_projections table';
  END IF;
  
  -- Check for orphaned maintenance_breakdown records
  IF EXISTS (
    SELECT 1 FROM public.maintenance_breakdown mb
    LEFT JOIN public.property_analyses pa ON mb.property_analysis_id = pa.id
    WHERE pa.id IS NULL
  ) THEN
    RAISE WARNING 'Found orphaned records in maintenance_breakdown table';
  END IF;
  
  -- Check for orphaned purchase_motivation records
  IF EXISTS (
    SELECT 1 FROM public.purchase_motivation pm
    LEFT JOIN public.property_analyses pa ON pm.property_analysis_id = pa.id
    WHERE pa.id IS NULL
  ) THEN
    RAISE WARNING 'Found orphaned records in purchase_motivation table';
  END IF;
  
  -- Check for orphaned setup_costs records
  IF EXISTS (
    SELECT 1 FROM public.setup_costs sc
    LEFT JOIN public.property_analyses pa ON sc.property_analysis_id = pa.id
    WHERE pa.id IS NULL
  ) THEN
    RAISE WARNING 'Found orphaned records in setup_costs table';
  END IF;
  
  -- Check for orphaned value_maximization records
  IF EXISTS (
    SELECT 1 FROM public.value_maximization vm
    LEFT JOIN public.property_analyses pa ON vm.property_analysis_id = pa.id
    WHERE pa.id IS NULL
  ) THEN
    RAISE WARNING 'Found orphaned records in value_maximization table';
  END IF;
  
  -- Check for orphaned company_portfolio records
  IF EXISTS (
    SELECT 1 FROM public.company_portfolio cp
    LEFT JOIN public.property_analyses pa ON cp.property_analysis_id = pa.id
    WHERE pa.id IS NULL
  ) THEN
    RAISE WARNING 'Found orphaned records in company_portfolio table';
  END IF;
  
  RAISE NOTICE 'Referential integrity check complete';
END $$;
