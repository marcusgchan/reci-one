export type FCConfig = {
  auth?: boolean;
  hideNav?: boolean;
};

export type CustomReactFC<T = {}> = React.FC<T> & FCConfig;

export type ParsedRecipe = {
  author: string
  canonical_url: string
  category: string
  cook_time: number
  cuisine: string
  description: string
  host: string
  image: string
  ingredients: string[]
  instructions_list: string[]
  language: string
  prep_time: number
  ratings: number
  site_name: string
  title: string
  total_time: number
  yields: string
}
