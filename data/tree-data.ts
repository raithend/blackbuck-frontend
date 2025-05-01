import { TreeNode } from '@/types/tree';

export const treeData: TreeNode = {
  name: "Life",
  children: [
    {
      name: "Bacteria",
      children: [
        {
          name: "Proteobacteria",
          children: [
            { name: "Alpha Proteobacteria" },
            { name: "Beta Proteobacteria" },
            { name: "Gamma Proteobacteria" }
          ]
        },
        {
          name: "Cyanobacteria",
          children: [
            { name: "Nostocales" },
            { name: "Oscillatoriales" }
          ]
        },
        {
          name: "Firmicutes",
          children: [
            { name: "Bacilli" },
            { name: "Clostridia" }
          ]
        }
      ]
    },
    {
      name: "Archaea",
      children: [
        {
          name: "Euryarchaeota",
          children: [
            { name: "Methanogens" },
            { name: "Halobacteria" }
          ]
        },
        {
          name: "Crenarchaeota",
          children: [
            { name: "Thermoprotei" },
            { name: "Nitrososphaeria" }
          ]
        },
        {
          name: "Thaumarchaeota",
          children: [
            { name: "Nitrososphaeria" },
            { name: "Nitrosopumilales" }
          ]
        }
      ]
    },
    {
      name: "Eukaryota",
      children: [
        {
          name: "Animals",
          children: [
            {
              name: "Vertebrates",
              children: [
                { name: "Mammals" },
                { name: "Birds" },
                { name: "Reptiles" },
                { name: "Amphibians" },
                { name: "Fish" }
              ]
            },
            {
              name: "Invertebrates",
              children: [
                { name: "Arthropods" },
                { name: "Mollusks" },
                { name: "Annelids" },
                { name: "Cnidarians" }
              ]
            }
          ]
        },
        {
          name: "Plants",
          children: [
            {
              name: "Angiosperms",
              children: [
                { name: "Monocots" },
                { name: "Eudicots" }
              ]
            },
            {
              name: "Gymnosperms",
              children: [
                { name: "Conifers" },
                { name: "Cycads" },
                { name: "Ginkgo" }
              ]
            },
            {
              name: "Ferns",
              children: [
                { name: "Leptosporangiate" },
                { name: "Marattiales" }
              ]
            }
          ]
        },
        {
          name: "Fungi",
          children: [
            {
              name: "Ascomycota",
              children: [
                { name: "Saccharomycetes" },
                { name: "Eurotiomycetes" }
              ]
            },
            {
              name: "Basidiomycota",
              children: [
                { name: "Agaricomycetes" },
                { name: "Ustilaginomycetes" }
              ]
            }
          ]
        },
        {
          name: "Protists",
          children: [
            {
              name: "Alveolates",
              children: [
                { name: "Ciliates" },
                { name: "Apicomplexa" }
              ]
            },
            {
              name: "Stramenopiles",
              children: [
                { name: "Diatoms" },
                { name: "Brown Algae" }
              ]
            }
          ]
        }
      ]
    }
  ]
}; 