import './RecommendationComponent.css';

type Props = {
  response2: any;
};

export default function ShowDetailsOfSuggestedFilm({ response2 }: Props) {
  console.log(response2);

  return (
    <div>
      <h1>YAY</h1>
    </div>
  );
}
