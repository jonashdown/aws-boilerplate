const imageBuilder = () => {
  const builder = {
    data: {
      id: {
        S: 'someid'
      }
    },
    typeMap: {
      object: 'M',
      string: 'S',
      number: 'N',
      boolean: 'BOOL'
    },
    withId: (id) => {
      builder.data.id.S = id;
      return builder;
    },
    withKeyValue: (key, value) => {
      builder.data[key] = {};
      const typeOfVal = typeof value;
      if (typeOfVal === 'number') {
        builder.data[key][builder.typeMap[typeOfVal]] = value.toString();
      } else {
        builder.data[key][builder.typeMap[typeOfVal]] = value;
      }
      return builder;
    },
    withList: (key, list) => {
      builder.data[key] = {};
      builder.data[key]['L'] = list;
      return builder;
    },
    withDate: (key, date) => {
      builder.data[key] = {};
      builder.data[key]['S'] = date;
      return builder;
    },
    getData: () => builder.data
  };
  return builder;
};

const keyBuilder = (id) => {
  return {
    id: {
      S: id
    }
  };
};

module.exports = {
  imageBuilder,
  keyBuilder
};
