package com.mediconnect.pharmacy.bootstrap;

import com.mediconnect.pharmacy.model.MedicineCatalog;
import com.mediconnect.pharmacy.repository.MedicineCatalogRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
public class MedicineCatalogSeeder implements CommandLineRunner {

    private static final String IMAGE_GENERIC = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200";
    private static final String IMAGE_CARDIO = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200";
    private static final String IMAGE_WELLNESS = "https://images.unsplash.com/photo-1550572017-0b19614742cb?w=200";

    private final MedicineCatalogRepository medicineCatalogRepository;

    public MedicineCatalogSeeder(MedicineCatalogRepository medicineCatalogRepository) {
        this.medicineCatalogRepository = medicineCatalogRepository;
    }

    @Override
    public void run(String... args) {
        if (medicineCatalogRepository.count() > 0) {
            return;
        }

        medicineCatalogRepository.saveAll(buildSeedMedicines());
    }

    private List<MedicineCatalog> buildSeedMedicines() {
        List<MedicineBlueprint> blueprints = List.of(
            new MedicineBlueprint(
                "Amoxicillin",
                "Antibiotic",
                "Capsules",
                "21 Caps",
                true,
                new BigDecimal("9.50"),
                new BigDecimal("0.00"),
                IMAGE_GENERIC,
                List.of(
                    "250mg Capsules",
                    "500mg Capsules",
                    "875mg Tablets",
                    "250mg/5mL Suspension",
                    "400mg/5mL Suspension",
                    "125mg/5mL Suspension",
                    "500mg Chewable",
                    "875mg Chewable",
                    "500mg XR",
                    "875mg XR"
                )
            ),
            new MedicineBlueprint(
                "Lisinopril",
                "Blood Pressure",
                "Tablets",
                "30 Tabs",
                false,
                new BigDecimal("8.00"),
                new BigDecimal("2.50"),
                IMAGE_CARDIO,
                List.of(
                    "2.5mg Tablets",
                    "5mg Tablets",
                    "10mg Tablets",
                    "20mg Tablets",
                    "40mg Tablets",
                    "5mg ODT",
                    "10mg ODT",
                    "20mg ODT",
                    "10mg/HCTZ Tablets",
                    "20mg/HCTZ Tablets"
                )
            ),
            new MedicineBlueprint(
                "Metformin",
                "Diabetes Care",
                "Tablets",
                "60 Tabs",
                true,
                new BigDecimal("7.25"),
                new BigDecimal("0.00"),
                IMAGE_WELLNESS,
                List.of(
                    "500mg Tablets",
                    "850mg Tablets",
                    "1000mg Tablets",
                    "500mg ER",
                    "750mg ER",
                    "1000mg ER",
                    "500mg XR",
                    "750mg XR",
                    "1000mg XR",
                    "500mg Solution"
                )
            ),
            new MedicineBlueprint(
                "Atorvastatin",
                "Cholesterol",
                "Tablets",
                "30 Tabs",
                false,
                new BigDecimal("11.20"),
                new BigDecimal("3.00"),
                IMAGE_CARDIO,
                List.of(
                    "10mg Tablets",
                    "20mg Tablets",
                    "40mg Tablets",
                    "80mg Tablets",
                    "10mg Chewable",
                    "20mg Chewable",
                    "40mg Chewable",
                    "10mg ODT",
                    "20mg ODT",
                    "40mg ODT"
                )
            ),
            new MedicineBlueprint(
                "Amlodipine",
                "Blood Pressure",
                "Tablets",
                "30 Tabs",
                true,
                new BigDecimal("6.90"),
                new BigDecimal("0.00"),
                IMAGE_CARDIO,
                List.of(
                    "2.5mg Tablets",
                    "5mg Tablets",
                    "10mg Tablets",
                    "2.5mg ODT",
                    "5mg ODT",
                    "10mg ODT",
                    "5mg Chewable",
                    "10mg Chewable",
                    "5mg Combo",
                    "10mg Combo"
                )
            ),
            new MedicineBlueprint(
                "Omeprazole",
                "Acid Reflux",
                "Capsules",
                "14 Caps",
                true,
                new BigDecimal("9.10"),
                new BigDecimal("0.00"),
                IMAGE_GENERIC,
                List.of(
                    "10mg Capsules",
                    "20mg Capsules",
                    "40mg Capsules",
                    "10mg DR Capsules",
                    "20mg DR Capsules",
                    "40mg DR Capsules",
                    "10mg ODT",
                    "20mg ODT",
                    "40mg ODT",
                    "20mg Packets"
                )
            ),
            new MedicineBlueprint(
                "Losartan",
                "Blood Pressure",
                "Tablets",
                "30 Tabs",
                false,
                new BigDecimal("10.40"),
                new BigDecimal("2.75"),
                IMAGE_CARDIO,
                List.of(
                    "25mg Tablets",
                    "50mg Tablets",
                    "100mg Tablets",
                    "25mg/HCTZ Tablets",
                    "50mg/HCTZ Tablets",
                    "100mg/HCTZ Tablets",
                    "25mg ODT",
                    "50mg ODT",
                    "100mg ODT",
                    "25mg Chewable"
                )
            ),
            new MedicineBlueprint(
                "Sertraline",
                "Mental Health",
                "Tablets",
                "30 Tabs",
                true,
                new BigDecimal("12.75"),
                new BigDecimal("0.00"),
                IMAGE_WELLNESS,
                List.of(
                    "25mg Tablets",
                    "50mg Tablets",
                    "100mg Tablets",
                    "150mg Tablets",
                    "200mg Tablets",
                    "25mg ODT",
                    "50mg ODT",
                    "100mg ODT",
                    "20mg/mL Solution",
                    "50mg/mL Solution"
                )
            ),
            new MedicineBlueprint(
                "Levothyroxine",
                "Thyroid",
                "Tablets",
                "30 Tabs",
                true,
                new BigDecimal("7.80"),
                new BigDecimal("0.00"),
                IMAGE_WELLNESS,
                List.of(
                    "25mcg Tablets",
                    "50mcg Tablets",
                    "75mcg Tablets",
                    "88mcg Tablets",
                    "100mcg Tablets",
                    "112mcg Tablets",
                    "125mcg Tablets",
                    "137mcg Tablets",
                    "150mcg Tablets",
                    "175mcg Tablets"
                )
            ),
            new MedicineBlueprint(
                "Cetirizine",
                "Allergy Relief",
                "Tablets",
                "24 Tabs",
                true,
                new BigDecimal("5.60"),
                new BigDecimal("0.00"),
                IMAGE_GENERIC,
                List.of(
                    "5mg Tablets",
                    "10mg Tablets",
                    "5mg Chewable",
                    "10mg Chewable",
                    "5mg Syrup",
                    "10mg Syrup",
                    "5mg ODT",
                    "10mg ODT",
                    "5mg Rapid Dissolve",
                    "10mg Rapid Dissolve"
                )
            ),
            new MedicineBlueprint(
                "Acetaminophen",
                "Pain Relief",
                "Tablets",
                "24 Tabs",
                true,
                new BigDecimal("4.80"),
                new BigDecimal("0.00"),
                IMAGE_GENERIC,
                List.of(
                    "325mg Tablets",
                    "500mg Tablets",
                    "650mg ER",
                    "160mg/5mL Suspension",
                    "80mg/0.8mL Drops",
                    "500mg Chewable",
                    "650mg Caplets",
                    "1000mg Caplets",
                    "500mg Oral Powder",
                    "650mg Oral Powder"
                )
            ),
            new MedicineBlueprint(
                "Gabapentin",
                "Neurology",
                "Capsules",
                "90 Caps",
                false,
                new BigDecimal("13.40"),
                new BigDecimal("4.25"),
                IMAGE_WELLNESS,
                List.of(
                    "100mg Capsules",
                    "300mg Capsules",
                    "400mg Capsules",
                    "600mg Capsules",
                    "800mg Capsules",
                    "100mg Tablets",
                    "300mg Tablets",
                    "400mg Tablets",
                    "600mg Tablets",
                    "800mg Tablets"
                )
            )
        );

        List<MedicineCatalog> medicines = new ArrayList<>();
        for (MedicineBlueprint blueprint : blueprints) {
            for (int index = 0; index < blueprint.strengths().size(); index++) {
                String strength = blueprint.strengths().get(index);
                BigDecimal price = blueprint.basePrice()
                        .add(BigDecimal.valueOf(index * 1.15d))
                        .setScale(2, RoundingMode.HALF_UP);

                BigDecimal copay = blueprint.covered()
                        ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                        : blueprint.baseCopay()
                            .add(BigDecimal.valueOf((index % 4) * 0.85d))
                            .setScale(2, RoundingMode.HALF_UP);

                medicines.add(MedicineCatalog.builder()
                        .name(blueprint.name())
                        .strength(strength)
                        .dosageForm(blueprint.dosageForm())
                        .category(blueprint.category())
                        .packSize(blueprint.packSize())
                        .price(price)
                        .covered(blueprint.covered())
                        .copay(copay)
                        .imageUrl(blueprint.imageUrl())
                        .description(blueprint.category() + " catalog option for " + strength)
                        .build());
            }
        }

        return medicines;
    }

    private record MedicineBlueprint(
            String name,
            String category,
            String dosageForm,
            String packSize,
            boolean covered,
            BigDecimal basePrice,
            BigDecimal baseCopay,
            String imageUrl,
            List<String> strengths
    ) {
    }
}