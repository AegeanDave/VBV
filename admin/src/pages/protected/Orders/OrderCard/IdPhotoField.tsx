import { useEffect, useState } from "react";
import {
  Grid,
  Skeleton,
  IconButton,
  ImageListItem,
  ImageList,
  ImageListItemBar,
} from "@mui/material";
import { getIdPhoto } from "../../../../api/order";
import DownloadIcon from "@mui/icons-material/Download";

interface Props {
  id: string;
}
export default function IdPhoto({ id }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<any>();

  useEffect(() => {
    const loadPhotos = async () => {
      setTimeout(async () => {
        try {
          const result = await getIdPhoto(id);
          setPhotos(result.data);
        } catch (err) {
          console.log(err);
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    };

    loadPhotos();
  }, []);

  if (isLoading)
    return (
      <Grid item container xs={12} spacing={1} p={1}>
        <Grid item xs>
          <Skeleton variant="rectangular" width={150} height={110}></Skeleton>
        </Grid>
        <Grid item xs>
          <Skeleton variant="rectangular" width={150} height={110}></Skeleton>
        </Grid>
      </Grid>
    );

  return (
    <Grid item xs={12}>
      <ImageList sx={{ width: "100%" }}>
        <ImageListItem key={photos!.idPhotoFrontUrl}>
          <img
            srcSet={`${
              photos!.idPhotoFrontUrl
            }?w=248&fit=crop&auto=format&dpr=2 2x`}
            src={`${photos!.idPhotoFrontUrl}?w=248&fit=crop&auto=format`}
            alt="front"
            loading="lazy"
          />
          <ImageListItemBar
            actionIcon={
              <IconButton
                sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                component="a"
                href={photos!.idPhotoBackUrl}
              >
                <DownloadIcon />
              </IconButton>
            }
          />
        </ImageListItem>
        <ImageListItem key={photos!.idPhotoBackUrl}>
          <img
            srcSet={`${
              photos!.idPhotoBackUrl
            }?w=248&fit=crop&auto=format&dpr=2 2x`}
            src={`${photos!.idPhotoBackUrl}?w=248&fit=crop&auto=format`}
            alt="front"
            loading="lazy"
          />
          <ImageListItemBar
            actionIcon={
              <IconButton
                component="a"
                href={photos!.idPhotoBackUrl}
                sx={{ color: "rgba(255, 255, 255, 0.54)" }}
              >
                <DownloadIcon />
              </IconButton>
            }
          />
        </ImageListItem>
      </ImageList>
    </Grid>
  );
}
