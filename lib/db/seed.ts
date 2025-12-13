import { db } from "@/lib/firebase";
import { collection, addDoc, writeBatch, doc } from "firebase/firestore";
// import { products, categories } from "@/lib/data"; // Assuming we have some local data or we can define it here

const SEED_CATEGORIES = [
    {
        name: 'Arepas',
        slug: 'arepas',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADQRy0eivadxQ_9AZYVhp8QHVlb2eEtLl3H5-FJ-F3Camumlzt3ZVTGFI1DIhfsC3WnsxO-Jrro62iqh4ax_hzQzT0zx2qcBLY_tw5xlyzIXHdntxuhkZ-76tHqoPwZIwXqEg0wQiEmNyBHj371hboS8d2Dkb7I-d0Adji-nN7GsNQLIrDGobcUWEtJFWt7x0hZxhhp_fmIdZSYWQCi-RMHurrBv7b5wNUoiljPH18dt2sg5G4HWd6A35H3CENo0YuV6FOpHpLXCE'
    },
    {
        name: 'Bandejas',
        slug: 'bandejas',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-0nCJa0Vfuy1Q1Wv8GLdXZXxc9rUzs4w2Qe31oxNQecC6bVZQ4pCTC8zzKQ3Y4_8zpDntk0YXstVH-DEqIpbYey9-fP0O381Xso-90DJa0LduqDxn7D5T0ncjiw2mdcFitSKiYTFYbPt4d2_s2OuqpfGLs1Z38Cs5kpmsqg4dZrQa1MJkwETAZNcEZAXixW_4fdgwZ2ylyq1rX4nuZI_0GYePOgYgpV7QW2Z24TgOByNp3xi0Ilt9jqrwulr6n3nHvzo2lmTKCfE'
    },
    {
        name: 'Sopas',
        slug: 'sopas',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO8d7dKdv6RwnutPDtMZsyY1hgR-bMfmXnWaT_JFsPKpypY7vWC2xv86j7i3numL_zMciOR4eEX77vTOB3aTKn181tj7ZHwgLxMRt03d4mbnhojLC6H4eL2VuQb5cpvr2P6iRIy-CwdFaYLmS-N2JOD8l1VBH9YAQzRfu8b39HqGsVkVnGKBGZ_jU3RtGezomjowGRS2WbVL8sBYZUqTKeVrKCi2St1H6wQyOBpJHLUJZuTsb_yhYaViSQfsCNykMnDKF5UhupuhQ'
    },
    {
        name: 'Bebidas',
        slug: 'bebidas',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHIZ-Fsl5_NqoY3rbQ6u5VHuNO97jDWt6nnwogfrn5Hp_t0ahT-jfWzD1Y00jAbZQqZN043YZbAgNVbJ_RaTnliSnG_tksCYJaU4VnhBh-KxpqwKDH3x6JzWPQWoj9NU5FLOGazSczQdefq1gxWrvUr6ixJb_Mxoz_aVTy-_pQHaIeYlu8AhhOveOoD8Xv7I_k_fJDF6kgNbDK1EmvLgzZupqbeCLKubG80kOxPc9npPm8a0rVb3SfWQ3CcMFBOS_b43wUHc-wihM'
    }
];

const SEED_PRODUCTS = [
    {
        name: 'Bandeja Paisa',
        description: 'Frijoles, arroz, chicharrón, carne, chorizo, huevo, arepa y plátano maduro.',
        price: 18.50,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyHwL8aJ9rCEhgSOC12qH-hp140INltIKoyClCfOWXgbDCXqu9FVrZH_ctfTP7r97av1Z5IH6TToyQ0P0glW-hv4PC5XjXNIbRqrtwrErF_IPnnoO71c5gGpIUfzgh1Raev-dj5D2FZL9Wo8wdGlHC9STLwUtwJHsG0NnJcVJb-3_GTEyedNRQRFKNQdy0d43twvozKoi4U7hff7OzwKohf8Ij2OTkNWK1t-S2kocPboNMO1eNfQRMw5qbA8QyvChQPKxLH99gGRg',
        categorySlug: 'bandejas',
        stock: 50,
        inStock: true
    },
    {
        name: 'Arepa con Queso',
        description: 'Deliciosa arepa de maíz blanco rellena de queso fresco derretido.',
        price: 8.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOeMLJqk49jWvIg4awCRpTCtUz3Gbql9vP_sD7i6oVCCA6J_kfaPht6W_VLLGpLp0A2aIiA8kRpFgYmQvlV5_00Jw-i4GApfVSy5G_bruhzUbW5GA6jHFf0G8RNcA1tnxJd9-V7rcoE5NxHQcsfccS45ZsKrYi9OY-OCllA9vik7fEJQfBDemEyI1c2Fbods7qrjP7u6mcr8MyLfIHmPE7chGiqUShIBnK1B278FMowjL986NXAOZYwu1MkhX3sFSr_UZzb7mLGis',
        categorySlug: 'arepas',
        stock: 100,
        inStock: true
    },
    {
        name: 'Sancocho de Gallina',
        description: 'Sopa tradicional y reconfortante, perfecta para cualquier día.',
        price: 15.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5wjPvbbDsIeJUVG6yG8rACSzW0eyEdHyBx8d7zII0kF62dIk-cTKtf9WG_SMNSxilnQGxWxjB1eIhZR7YDabw7YZag7ykKXlEzsR0fSuqUsM-JfDVOgtdYaJQV1H-9AVv-B3ai47B29YS3wRkMxvby8GYaHl1Q_ttVI58C2VSgxWJTwo3_WNvRxxCGZBXLTaVB9yDEV1r1Bmz_sNYkswhzfoDTqygeyFS2lPHMTXGNz_oOWsMIpN6zPXtW6UzhQGElcbFSNHB8Ng',
        categorySlug: 'sopas',
        stock: 20,
        inStock: true
    }
];

export const seedDatabase = async () => {
    try {
        const batch = writeBatch(db);

        // Maps to store category types to IDs
        const categoryMap: Record<string, string> = {};

        // Seed Categories
        for (const cat of SEED_CATEGORIES) {
            const docRef = doc(collection(db, "categories"));
            categoryMap[cat.slug] = docRef.id;
            batch.set(docRef, cat);
        }

        // Seed Products
        for (const prod of SEED_PRODUCTS) {
            const docRef = doc(collection(db, "products"));
            const { categorySlug, ...productData } = prod;
            batch.set(docRef, {
                ...productData,
                categoryId: categoryMap[categorySlug],
                createdAt: Date.now()
            });
        }

        await batch.commit();
        console.log("Database seeded successfully!");
        return true;
    } catch (error) {
        console.error("Error seeding database:", error);
        return false;
    }
};
