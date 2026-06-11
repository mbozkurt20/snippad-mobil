// Plan slug ↔ Store product ID eşleşmesi
// App Store Connect ve Google Play Console'da bu ID'lerle subscription oluştur.
export const PLAN_TO_PRODUCT_ID: Record<string, string> = {
  basic:              'klavyem_basic_monthly',
  basic_yearly:       'klavyem_basic_yearly',
  pro:                'klavyem_pro_monthly',
  pro_yearly:         'klavyem_pro_yearly',
  business:           'klavyem_business_monthly',
  business_yearly:    'klavyem_business_yearly',
  ultra_pro:          'klavyem_ultra_pro_monthly',
  ultra_pro_yearly:   'klavyem_ultra_pro_yearly',
};

// Ters harita: product ID → plan slug
export const PRODUCT_TO_PLAN: Record<string, string> = Object.fromEntries(
  Object.entries(PLAN_TO_PRODUCT_ID).map(([slug, pid]) => [pid, slug])
);

// Tüm product ID listesi (getSubscriptions için)
export const PRODUCT_IDS = Object.values(PLAN_TO_PRODUCT_ID);
