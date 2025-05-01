export interface TreeNode {
  name: string;
  children?: TreeNode[];
}

export const sampleTreeData: TreeNode = {
  name: "Life",
  children: [
    {
      name: "Bacteria",
      children: [
        { name: "Proteobacteria" },
        { name: "Cyanobacteria" }
      ]
    },
    {
      name: "Archaea",
      children: [
        { name: "Euryarchaeota" },
        { name: "Crenarchaeota" }
      ]
    },
    {
      name: "Eukaryota",
      children: [
        {
          name: "Animals",
          children: [
            { name: "Vertebrates" },
            { name: "Invertebrates" }
          ]
        },
        {
          name: "Plants",
          children: [
            { name: "Angiosperms" },
            { name: "Gymnosperms" }
          ]
        }
      ]
    }
  ]
}; 