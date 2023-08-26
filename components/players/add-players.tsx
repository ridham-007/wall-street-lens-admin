import { readCSVFile } from "@/utils/csv";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { Modal } from "../model";

const LEAGUE_DROPDOWN = gql`
  query GetLeagues(
    $userId: String
  ) {
    getLeagues(
      userId: $userId
    ) {
      code
      success
      message
      data {
        _id
        name
      }
    }
  }
`;

const IMPORT_PLAYERS = gql`
  mutation ImportPlayers($leagueId: String!, $data: String!) {
    importPlayers(leagueId: $leagueId, data: $data) {
      code
      success
      message
      data
    }
  }
`;

interface AddPlayersOnSuccess {
  (): void;
}

interface AddPlayersOnClose {
  (): void;
}

interface AddPlayersProps {
  onSuccess?: AddPlayersOnSuccess;
  onClose?: AddPlayersOnClose;
  data?: any;
  userID?: any;
  userRole?: any;
}

export default function AddPlayers(props: AddPlayersProps) {
  const [leagueId, setLeagueId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { data: leagues } = useQuery(LEAGUE_DROPDOWN, {
    variables: { userId: props.userRole !== 'admin' && props.userRole !== 'player' ? props.userID : null },
  });
  const [importPlayers, { data }] = useMutation(IMPORT_PLAYERS);

  useEffect(() => {
    if (data?.importPlayers?.data) {
      props?.onSuccess && props?.onSuccess();
    }
  }, [data])

  const addPlayers = async () => {
    try {
      if (!file) return;
      const fileText = await readCSVFile(file);
      await importPlayers({
        variables: {
          leagueId,
          data: fileText,
        },
      });
    } catch (err) {
      console.log(JSON.parse(JSON.stringify(err)));
    }
  };

  return (
    <Modal showModal={true} onClose={() => props.onClose && props.onClose()}>
      <form className="form w-100">
        <div className="flex flex-row flex-wrap">
          <div className="w-full md:w-1/2 lg:w-1/3 my-2">
            <label htmlFor="leagueId" className="font-bold">
              League
            </label>

            <div>
              <select
                name="leagueId"
                id="leagueId"
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
              >
                <option>Select a league</option>
                {leagues?.getLeagues?.code === 200 &&
                  leagues?.getLeagues?.data?.map((league: any) => (
                    <option key={league?._id} value={league?._id}>
                      {league?.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="w-full md:w-1/2 lg:w-1/3 my-2">
            <label htmlFor="firstName" className="font-bold">
              Select File
            </label>

            <div>
              <input
                type="file"
                onChange={(e) => {
                  if (e?.target.files?.length) setFile(e?.target.files[0]);
                }}
              />
            </div>
          </div>
        </div>

        <hr />

        <div className="my-2">
          <button
            className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
            type="button"
            onClick={() => addPlayers()}
            disabled={!file || !leagueId}
          >
            Add Players
          </button>

          <button onClick={props.onClose} className="transform hover:bg-red-600 transition duration-300 hover:scale-105 text-white bg-red-500 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center mr-2 mb-2">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
