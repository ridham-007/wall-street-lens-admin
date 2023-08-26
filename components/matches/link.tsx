import { copyTextToClipboard } from "@/utils/clipboard";
import { gql, useQuery } from "@apollo/client";

const MATCH_LINK = gql`
  query GetMatchLink($matchId: String!, $teamId: String!) {
    getMatchLink(id: $matchId, teamId: $teamId) {
      code
      success
      message
      data
    }
  }
`;

export const MatchLink = (props: {
  matchId: string;
  teamId: string;
  title: string;
  label: string;
  marginEnable: boolean;
}) => {
  const { data, error, loading } = useQuery(MATCH_LINK, {
    variables: {
      matchId: props.matchId,
      teamId: props.teamId,
    },
  });

  const onLinkClick = (ev: any) => {
    ev.preventDefault();
    if (data) {
      window.open(data?.getMatchLink?.data, "_blank");
      copyTextToClipboard(data?.getMatchLink?.data);
    }
  };

  return (
    <a
      style={{
        marginTop: props.marginEnable ? "10px" : "0px"
      }}
      href="#"
      onClick={onLinkClick}
      className="mx-1 text-blue-500 hover:text-blue-900"
    >
      <span style={{
        color: 'black'
      }}>{props.label}</span>{props.title}
    </a>
  );
};
