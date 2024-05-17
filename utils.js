
/**
 * Take in string
 * Returns array with string split by spaces, capitalizes first letter,
 * and make the rest lower case
 *
 * Input:
 * 'aubrey sherman'
 * Output:
 * ['Aubrey', 'Sherman']
 * FIXME: change function name
 */
function formatName(name) {
  return name.trim().split(' ').map(name => {
    return name[0].toUpperCase() + name.slice(1).toLowerCase();
  });
}

export { formatName };