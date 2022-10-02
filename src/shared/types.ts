export type FCConfig = {
  auth?: boolean;
  hideNav?: boolean;
};

export type CustomReactFC<T = {}> = React.FC<T> & FCConfig;
